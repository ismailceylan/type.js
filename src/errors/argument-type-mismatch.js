import { readableJoin, typeName, typeNames } from "../utils/index.js";

export default class ArgumentTypeMismatch extends Error
{
	constructor( iface, type, methodRule, argRule, position, value )
	{
		super();

		this.name = "ArgumentTypeMismatch";
		this.iface = iface;
		this.type = type;
		this.methodRule = methodRule;
		this.argRule = argRule;
		this.position = position;
		this.value = value;

		this.message = argRule.types.length === 0
			? this.argumentShouldPassMessage()
			: this.argumentTypeMismatchMessage();
	}

	argumentTypeMismatchMessage()
	{
		return `${ this.iface.name } interface requires ${ this.type.name }.${ this.methodRule.name } method's ${ this.position }st argument (#${ this.argRule.name }) must be ${ readableJoin( typeNames( this.argRule.types )).toLowerCase()} but received ${ typeName( this.value ).toLowerCase()}.`;
	}

	argumentShouldPassMessage()
	{
		return `The ${ this.iface.name } interface prevents calling the ${ this.type.name }.${ this.methodRule.name } method without defining the ${ this.position }th argument (#${ this.argRule.name }).`;
	}
}
