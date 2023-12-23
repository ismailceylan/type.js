import { BreakSignal } from "../symbols.js";

/**
 * Loops an given object's enumerable properties and pass them
 * into given method.
 * 
 * @param {Object} object an object to loop it's props
 * @param {Function} handler a method that's gonna take every property as argument
 * @return {Object}
 */
export default function each( object, handler )
{
	let i = 0;

	for( const key in object )
	{
		if( handler( object[ key ], key, i++ ) === BreakSignal )
		{
			break;
		}
	}

	return object;
}
