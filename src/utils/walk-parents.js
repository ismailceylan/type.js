/**
 * Walks through all parents of the given object.
 * 
 * @param {Object} entry an object for entry point
 * @param {String} propName a prop name that holds reference to parent object
 * @param {Function} handler a callback that will receive current item in looping
 * @returns {Object}
 */
export default function walkParents( entry, propName, handler )
{
	let current = entry;

	do
	{
		handler( current );
	}
	while( current = current[ propName ]);

	return entry
}
