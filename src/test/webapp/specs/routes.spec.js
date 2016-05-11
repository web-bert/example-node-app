var routes = require( '../../../webapp/routes.js' );

describe( 'Routes', function(){
	
	it( 'Should be a function', function(){

		expect( routes ).toBeDefined();
		expect( typeof routes ).toEqual( 'function' );
	} );
} );