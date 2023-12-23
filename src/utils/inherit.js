import { walkParents } from "./index.js";

/**
 * Collects properties from a source on the given entry point and all parents.
 * 
 * @param {Object} entry an object for entry point
 * @param {String} propName a prop name that holds reference to parent object
 * @param {Function} shouldReturnSourceCallback a method that should return
 *   source object to collect it's props
 * @returns {Object}
 */
export default function inherit( entry, propName, shouldReturnSourceCallback )
{
	let stack = {}

	walkParents( entry, propName, current =>
	{
		const tmp = {}

		// we copied source to temporary
		Object.assign( tmp, shouldReturnSourceCallback( current ));
		// we overrided tmp with stack
		Object.assign( tmp, stack );

		stack = tmp;
	});

	return stack;
}
