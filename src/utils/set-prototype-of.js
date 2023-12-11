export default function setPrototypeOf( target, proto )
{
	if( "setPrototypeOf" in Object )
	{
		Object.setPrototypeOf( target, proto );

		return proto;
	}

	return target.__proto__ = proto;
}
