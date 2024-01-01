import { typeName } from "./index.js";

export default function typeNames( types )
{
	const stack = [];

	for( const type of types )
	{
		if( type?.prototype?.constructor?.name )
		{
			stack.push( type.prototype.constructor.name );
		}
		else
		{
			if( type === undefined )
			{
				stack.push( "undefined" );
			}
			else if( type === null )
			{
				stack.push( "null" );
			}
			else
			{
				stack.push( typeName( type ));
			}
		}
	}

	return stack;
}
