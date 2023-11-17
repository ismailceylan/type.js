export default function typeNames( types )
{
	var stack = [];

	for( var type of types )
	{
		stack.push( type.prototype.constructor.name );
	}

	return stack;
}
