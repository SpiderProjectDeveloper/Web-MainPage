// webpack.config.js
// var BomPlugin = require('webpack-utf8-bom');
const path = require('path');

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000,
		setup(app) {
			app.get('/.contents', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/contents'));
			});
			app.get('/.check_connection', (req, res) => {
				res.send("1"); 
			});
			app.get('/.check_authorized', (req, res) => {
				res.send("1"); 
			});
			app.get('/.get_project_props', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/get_project_props'));
			});
			app.get('/.get_gantt_structs', (req, res) => {
			  res.sendFile(path.resolve(__dirname, 'public/get_gantt_structs'));
			});
			app.post('/.login', (req, res) => {
				res.send('LWHLEWRIUREWILUTERUITHERUIHTLIEKJERBFJEBERVKERJKERBKHERKJERHEK'); 
			});
			app.get('/.logout', (req, res) => {
				res.send("1"); 
			});
			//app.get('/bundle.js', (req, res) => {
			//	  res.sendFile(path.resolve(__dirname, 'dist/bundle.js'));
			//});
		}
  },
  entry: [
    './src/index.js',
  ],
  optimization: {
    minimize: true,
  },
  output: {
	path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
			{
				loader: 'style-loader',
			}, 
			{
				loader: 'css-loader',
			}
        ]
      },
      {
        test: /\.html$/,
        loader: "html-loader",
		options: {
			attributes: false,
		},
      }
    ]
  }
};