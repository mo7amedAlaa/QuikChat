import jwt from "jsonwebtoken";
export generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: length });
    return token;
};