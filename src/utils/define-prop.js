/**
 * Creates a new not enumerable property into given object.
 * 
 * @param {Object} obj target object
 * @param {String} name new property name to add target object
 * @param {any} value new prop value
 */
export default function defineProp( obj, name, value )
{
	Object.defineProperty( obj, name,
	{
		value: value,
		writable: true,
		configurable: true,
		enumerable: false
	});
}
