const response = require("../components/response")
const jwt = require("jsonwebtoken")

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token === null) return response.res401(res);
  console.log({token})
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return response.res401(res)
    req.email = decoded.email;
    console.log({decoded})
    next()
  })
}

exports.verifyTokenStudent = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log({token})
  if (token === null) return response.res401(res);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_STUDENT, (err, decoded) => {
    if (err) return response.res401(res)
    req.user = decoded;
    next()
  })
}

exports.verifyTokenTeacher = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log({token})
  if (token === null) return response.res401(res);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_TEACHER, (err, decoded) => {
    if (err) return response.res401(res)
    req.user = decoded;
    next()
  })
}
