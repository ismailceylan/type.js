import { Builder } from "./index.js";
import { getArguments, typeName } from "../utils/index.js";
import {
	MissingArgumentError, PropAssignTypeMismatchError,
	MissingMethodError, MissingPropError, PropTypeMismatchError,
} from "../errors/index.js";

export default function Interface( name, build )
{
	if( ! ( this instanceof Interface ))
	{
		return new Interface( name, build );
	}

	var builder = new Builder;

	build( builder );

	/**
	 * Interface name.
	 * 
	 * @type {String}
	 */
	this.name = name;

	/**
	 * Interface properties.
	 * 
	 * @type {Object}
	 */
	this.properties = builder.properties;

	/**
	 * Interface methods.
	 * 
	 * @type {Object}
	 */
	this.methods = builder.methods;

	/**
	 * Applies the represented Interface to a given Type object.
	 * 
	 * @param {Type} type a type object to apply this interface
	 */
	this.apply = function( type )
	{
		validateProperties.call( this, type );
		validateMethods.call( this, type );
	}

	function validateProperties( type )
	{
		for( var ruleName in this.properties )
		{
			var rule = this.properties[ ruleName ];
			var name = rule.name;
			var allows = rule.types;
			var required = rule.isRequired;
			var defined = name in type.properties;
			var value = type.properties[ name ];
			var restricted = rule.types.length > 0;

			// checking if prop needs to be defined
			if( required && ! defined )
			{
				// prop not defined directly on type
				throw new MissingPropError( this, type, rule );
			}

			// type checking
			if( defined && restricted && ! allowed( value, allows ))
			{
				throw new PropTypeMismatchError( this, type, rule, value );
			}

			// if prop restricted we have to observe future writings
			if( restricted )
			{
				var iface = this;

				Object.defineProperty( type.properties, name,
				{
					get: function()
					{
						return value;
					},
	
					set: function( v )
					{
						if( ! allowed( v, allows ))
						{
							throw new PropAssignTypeMismatchError( iface, type, rule, v );
						}

						value = v;
					}
				});
			}
		}
	}

	function validateMethods( type )
	{
		for( var ruleName in this.methods )
		{
			var methodRule = this.methods[ ruleName ];
			var methodName = methodRule.name;
			var method = type.methods[ methodName ];
			var defined = methodName in type.methods;
			var definedArgs = getArguments( method.toString());

			// methods are required
			if( ! defined )
			{
				throw new MissingMethodError( this, type, methodRule );
			}
		}
	}
}

function allowed( value, types )
{
	for( var type of types )
	{
		if( typeName( value ) == type.prototype.constructor.name )
		{
			return true;
		}
	}

	return false;
}
