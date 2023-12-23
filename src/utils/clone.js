/**
 * Takes all the properties from a given source object and
 * write them into target object.
 * 
 * @param {Object} from source object
 * @param {Object} target target object
 * @returns {Object}
 */
export default function clone( from, target )
{
	Object.defineProperties(
		target,
		Object.getOwnPropertyDescriptors( from )
	);

	return target;
}
