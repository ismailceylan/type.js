import { typeName } from "./index.js";

export default function deepClone( source )
{
	let stack;

	if( Array.isArray( source ))
	{
		stack = [];

		for( const item of source )
		{
			if( Array.isArray( item ) || typeName( item ) == "Object" )
			{
				stack.push( deepClone( item ));
			}
			else
			{
				stack.push( item );
			}
		}
	}
	else if( typeName( source ) == "Object" )
	{
		stack = {}

		for( const key in source )
		{
			const val = source[ key ];
			const descriptor = Object.getOwnPropertyDescriptor( source, key );

			if( "get" in descriptor || "set" in descriptor )
			{
				Object.defineProperty( stack, key, descriptor );
			}
			else if( Array.isArray( val ) || typeName( val ) == "Object" )
			{
				stack[ key ] = deepClone( val );
			}
			else
			{
				stack[ key ] = val;
			}
		}
	}


	return stack;
}
