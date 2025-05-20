import User from "../model/User.model.js";
import bcrypt from "bcrypt";
import generateToken from "../lib/utils.js";
import uploadOnCloudinary from "../lib/cloudinary.js";


/**
 * Handles user signup:
 * 1. Extracts email, fullName, password, and bio from request body.
 * 2. Validates required fields.
 * 3. Checks if a user with the given email already exists.
 * 4. Hashes the password using bcrypt.
 * 5. Creates a new user in the database.
 * 6. Generates a JWT token for the new user.
 * 7. Returns a success response with user info and token.
 * 8. Handles and logs errors, returning a 500 status on failure.
 
 * Handles user login:
 * 1. Extracts email and password from request body.
 * 2. Validates required fields.
 * 3. Finds the user by email in the database.
 * 4. Compares the provided password with the hashed password.
 * 5. Generates a JWT token if authentication is successful.
 * 6. Returns a success response with user info and token.
 * 7. Handles and logs errors, returning a 500 status on failure.
 * 
 */

const signup = async (req, res) => {
  const { email, fullName, password, bio } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      email,
      fullName,
      password: hashedPassword,
      bio
    });
    const token = generateToken(newUser._id);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        bio: newUser.bio,
        profilePic: newUser.profilePic
      },
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are filled
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare the password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT Token using your custom function
    const token = generateToken(user._id);

    // Send success response
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName, // changed from name to fullName for consistency
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic
      },
      token,
      message: "Login successful",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

const updateProfile = async (req, res) => {
  try {
    const { bio, fullName } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let updatedFields = { bio, fullName };

    if (req.file) {
      console.log("File received:", req.file);

      // Upload image to Cloudinary using uploadOnCloudinary helper
      const uploadResult = await uploadOnCloudinary(req.file.path);

      updatedFields.profilePic = uploadResult?.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.status(200).json({ success: true, message: "Profile updated", user: updatedUser });

  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

const checkAuth = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: user not found in request"
    });
  }
  res.json({
    success: true,
    user: req.user
  });
}

export { signup, login, checkAuth, updateProfile };
