export default function rename( source, renameMap, removeOlds )
{
	const stack = {}

	for( const key in source )
	{
		const value = source[ key ];

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
