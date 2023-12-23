/**
 * Sets a name to target object's tag.
 * 
 * @param {Object} targetObject target object
 * @param {String} tagName tag name
 * @returns {String}
 */
export default function setTag( targetObject, tagName )
{
	Object.defineProperty( targetObject, Symbol.toStringTag,
	{
		value: tagName,
		writable: false,
		configurable: false,
		enumerable: false
	});

	return tagName;
}
