import userModel from '../models/user.model.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import sessionModel from '../models/session.model.js'

export async function register(req, res) {
  try {
   
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No data received"
      });
    }

    let { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields required"
      });
    }
    email = email.trim().toLowerCase();

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }]
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "Account already exists"
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword
    });

    
    const refreshtoken = jwt.sign(
      { id: newUser._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshtoken)
      .digest("hex");

    const session = await sessionModel.create({
      user: newUser._id,
      refreshToken: refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown"
    });
    const accesstoken = jwt.sign(
      {
        id: newUser._id,
        session: session._id
      },
      config.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );
    res.cookie("refreshToken", refreshtoken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email
      },
      accesstoken
    });

  } catch (error) {
    console.log("🔥 REGISTER ERROR:", error); // ✅ FIXED LOG

    return res.status(500).json({
      message: error.message
    });
  }
}

export async function getMe(req, res) {

    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(401).json({
            message: "token not found"
        })
    }
    // token ko decode krte h or verify krte h ki wo valid hai ya nahi, agar valid hai to usme se user id nikalte h
    const decoded = jwt.verify(token, config.JWT_SECRET)

    const user = await userModel.findById(decoded.id)

    // agar user token k sath exsist krta hai to usko fetch kro
    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email,
        }
    })
}

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refrehtoken

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    // for getting new access token after refresh token 
    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session = await sessionModel.findOne({
        refreshToken: refreshTokenHash,
        revoked: false
    })
    if (!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id,
    }, config.JWT_SECRET,
        {
            expiresIn: '15min'
        })

    const newRefreshToken = jwt.sign({
        id: decoded.id,
    }, config.JWT_SECRET,
        {
            expiresIn: '7d'
        })

    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')

    session.refreshToken = newRefreshTokenHash
    await session.save()

    res.cookie("refrehtoken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })
}

export async function logout(req, res) {
   const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session = await sessionModel.findOne({
        refreshToken: refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(400).json({
            message: "Invalid refresh token"
        })
    }
    session.revoked = true
    await session.save()

    res.clearCookie("refrehtoken")
    res.status(200).json({
        message: "Logged out successfully"
    })
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        console.log("Searching email:", cleanEmail);

        const user = await userModel.findOne({ email: cleanEmail });

        console.log("BODY:", req.body);

        if (!user) {
            return res.status(400).json({ message: "User not found please create account first" });
        }

        // 🔥 SAME HASHING AS REGISTER
        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        console.log("Entered:", hashedPassword);
        console.log("Stored:", user.password);

        if (user.password !== hashedPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const accesstoken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "15min" }
        );

        res.status(200).json({
            message: "Login successful",
            accesstoken,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error" });
    }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const { age } = req.body;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { age },
      { new: true }
    );

    res.json({
      message: "Profile updated",
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  const { email, username } = req.body;

  let user = await userModel.findOne({ email });

  if (!user) {
    user = await userModel.create({
      email,
      username,
      password: "google-auth"
    });
  }

  const token = jwt.sign({ id: user._id }, config.JWT_SECRET);

  res.json({ token, user });
};
// access token - max 15 min
// refresh token - 7 days and more