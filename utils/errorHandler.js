module.exports = (res, err) => {
    console.warn(err)
    res.status(500).json({
        success: false,
        message: err.message ? err.message : err
    })
}