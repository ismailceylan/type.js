export default function typeNames( types )
{
	var stack = [];

	for( var type of types )
	{
		if( type && type.prototype && type.prototype.constructor && type.prototype.constructor.name )
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
		}
	}

	return stack;
}
