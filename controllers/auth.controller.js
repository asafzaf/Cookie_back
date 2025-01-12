const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");
const { BadRequestError, NotFoundError } = require("../errors/errors");
const catchAsync = require("../utils/catch.async");

const generate_token = (uid) => {
  return jwt.sign({ id: uid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(new BadRequestError("Token not provided"));
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new BadRequestError("Invalid token"));
    }
    const user = await userRepository.retrieve({ userId: decoded.id });
    if (!user) {
      return next(new BadRequestError("Invalid token"));
    }
    req.user = user;
    next();
  });
});

exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, uid } = req.body;
    if (!email || !uid) {
      return next(new BadRequestError("Email and uid are required"));
    }
    const user = await userRepository.retrieve({ userId: uid });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    if (user.email !== email) {
      return next(new BadRequestError("Email and uid do not match"));
    }
    const token = generate_token(user.userId);
    res.status(200).json({ data: user, token });
  } catch (error) {
    console.log(error);
  }
});

exports.Alogin = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required"));
    }
    const user = await userRepository.retrieve({ email: email });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }
    if (user.isAdmin === false) {
      return next(new BadRequestError("User is not an admin"));
    }
    console.log("user", user);
    console.log("user email", user.email);
    console.log("isAdmin", user.isAdmin);
    console.log("user password", user.password);
    console.log(password);
    if (user.password !== password) {
      return next(new BadRequestError("Password is incorrect"));
    }
    const token = generate_token(user.userId);
    res.status(200).json({ data: user, token });
  } catch (error) {
    console.log(error);
  }
});

exports.signup = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.userId) {
      return next(new BadRequestError("Email and uid are required"));
    } else if (!req.body.first_name || !req.body.last_name) {
      return next(new BadRequestError("First name and last name are required"));
    } else if (await userRepository.retrieve({ userId: req.body.userId })) {
      return next(new BadRequestError("User already exists"));
    } else if (await userRepository.retrieve({ email: req.body.email })) {
      return next(new BadRequestError("Email already exists"));
    }
    const user = await userRepository.create(req.body);
    const token = generate_token(user.userId);
    res.status(201).json({ data: user, token });
  } catch (error) {
    console.log(error);
  }
});
