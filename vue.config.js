module.exports = {
    devServer: {
        public: 'blacksheep.zapto.org:5555',
        port: 5555,
        proxy: 'http://readmythoughts.ddns.net:7070/'
    }
}