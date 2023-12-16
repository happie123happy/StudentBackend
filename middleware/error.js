export const errorHandler = async (err, req, res, next) => {
    
  console.log(
    `${err.name} : ${err.message} - ${err.statusCode} : HTTPMethod: ${req.method} Url: ${req.url}`
  );
    
  res.status(err.statusCode||400).json({
    status: err.statusCode || 400,
    name: err.name,
    message: err.message,
  });

};