export default function rename( source, renameMap, removeOlds )
{
	var stack = {}

	for( var key in source )
	{
		var value = source[ key ];

		if( key in renameMap )
		{
			stack[ renameMap[ key ]] = value;

			if( removeOlds !== true )
			{
				stack[ key ] = value;
			}
		}
		else
		{
			stack[ key ] = value;
		}
	}

	return stack;
}
