module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

// this is a function that takes in a function and returns a new function
// the new function is the one that is passed to the route
// and catches any errors that might occur
