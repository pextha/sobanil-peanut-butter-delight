import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  // This creates a token that expires in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export default generateToken;   