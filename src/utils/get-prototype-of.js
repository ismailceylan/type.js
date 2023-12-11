export default function getPrototypeOf( target )
{
	return "getPrototypeOf" in Object
		? Object.getPrototypeOf( target )
		: target.__proto__;
}
