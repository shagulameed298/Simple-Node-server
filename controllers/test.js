exports.Get = (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.json({ "name": "shagul" });
}