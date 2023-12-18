/**
 * Adds closure variables to the target method's closure bag.
 * 
 * @param {Function} method target method
 * @param {Object} variables closure variables as object key&val pairs
 * @param {String} filename filename for debugging
 * @returns {Function}
 */
export default function closured( method, variables, filename )
{
	var methodStr = method.toString().trim();
	var isShortClassMethod = /^(?!function)[\w$@]+\s*\(.*?\)\s*\{/.test( methodStr );

	return Function(
		Object.keys( variables ),
		"return " + ( isShortClassMethod? "function " : "" ) + methodStr + 
		( filename
			? "\n//# sourceURL=" + filename
			: "" )
	)
	.apply( undefined, Object.values( variables ));
}
