module.exports = function( express, app ){

	app.get( '/', function( req, res ){

		res.render( 'index.html' );
	} );
};