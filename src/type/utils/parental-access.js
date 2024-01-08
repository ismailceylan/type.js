import { getPrototypeOf } from "../../utils/index.js";

export default function parentalAccess(
	type, currentType, callerMethodName, root, proto, methodName, args
)
{
	if(( type = type.parent ) === null )
	{
		throw new ReferenceError(
			`Because of the ${ currentType.name } is a type that does not extend another type, the "parent" magic method shouldn't have been used in the ${ callerMethodName } method.`
		);
	}

	let ctx = getPrototypeOf( proto );

	// if root object is same with the proto
	// that we should work on it then first
	// level [[Prototype]] will lead infinite loop
	if( root === proto )
	{
		// we have to dive one level deeper
		ctx = getPrototypeOf( ctx );
		type = type.parent;
	}

	if( methodName === undefined )
	{
		methodName = callerMethodName;
	}

	if( methodName in ctx )
	{
		return ctx[ methodName ].apply( root, args );
	}
	else if( getPrototypeOf( ctx ) === null )
	{
		throw new ReferenceError(
			'"parent" method was called illegally in ' +
			type.parent.name + "." + callerMethodName + " method. " +
			"Within the parentless types, using parent method is ineffective."
		);
	}
	else if( currentType.parent === null )
	{
		throw new ReferenceError(
			`Because of the ${ currentType.name } is a type that does not extend another type, the "parent" magic method shouldn't have been used in the ${ callerMethodName } method.`
		);
	}
	else
	{
		throw new ReferenceError(
			"The parent method used in " + currentType.name + "." + callerMethodName +
			" tried to access method " + methodName + ", which is not defined in type " +
			currentType.parent.name + "!"
		);
	}
}
