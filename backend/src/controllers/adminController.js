const admin = require("../config/firebase");
const Admin = require("../models/Admin");

exports.createAdmin = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name,
        });

        // Save Admin to MongoDB (RBAC)
        await Admin.create({
            email,
            name,
            role: "admin"
        });

        res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            uid: userRecord.uid
        });

    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        // 1. Fetch authorized admins from MongoDB
        const dbAdmins = await Admin.find({});

        // 2. Extract emails
        const adminEmails = dbAdmins.map(admin => ({ email: admin.email }));

        if (adminEmails.length === 0) {
            return res.status(200).json({ success: true, admins: [] });
        }

        // 3. Fetch Firebase details for these users using getUsers (batch)
        // Note: getUsers takes an array of identifiers.
        const firebaseResult = await admin.auth().getUsers(adminEmails);

        // 4. Map to response format
        // Create a map for quick lookup of DB roles if needed
        const dbAdminMap = new Map(dbAdmins.map(a => [a.email, a]));

        const admins = firebaseResult.users.map((userRecord) => {
            const dbRecord = dbAdminMap.get(userRecord.email);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName || dbRecord.name, // Fallback to DB name
                photoURL: userRecord.photoURL,
                metadata: {
                    creationTime: userRecord.metadata.creationTime,
                    lastSignInTime: userRecord.metadata.lastSignInTime,
                },
                role: dbRecord ? dbRecord.role : 'admin'
            };
        });

        res.status(200).json({
            success: true,
            admins: admins,
        });
    } catch (error) {
        console.error("Error listing admins:", error);
        res.status(500).json({ success: false, message: "Failed to retireve admin list" });
    }
};

exports.checkAdminEmail = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Checking admin email:", email); // DEBUG
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const userRecord = await admin.auth().getUserByEmail(email);
        console.log("User found:", userRecord.uid); // DEBUG

        // RBAC CHECK
        const adminUser = await Admin.findOne({ email });
        if (!adminUser) {
            return res.status(403).json({ success: false, message: "Access Denied: You are not an authorized Administrator." });
        }

        // If no error thrown and admin exists in DB
        res.status(200).json({ success: true, exists: true, role: adminUser.role });
    } catch (error) {
        console.error("Error verifying email:", error.code, error.message); // DEBUG
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({ success: false, exists: false, message: "Email not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
