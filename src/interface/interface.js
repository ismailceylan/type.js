import { Builder } from "./index.js";
import { args, getArguments, typeName } from "../utils/index.js";
import {
	MissingArgumentError, PropAssignTypeMismatchError,
	MissingMethodError, MissingPropError, PropTypeMismatchError,
	ArgumentTypeMismatch
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
			var restricted = allows.length > 0;

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

			// if prop restricted for specific types
			// we have to observe future writings
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

			for( var i = 0; i < methodRule.arguments.length; i++ )
			{
				var argRule = methodRule.arguments[ i ];
				var argNameInDefinition = definedArgs[ i ];
				var required = argRule.isRequired;

				// argument is required and not defined on the method
				if( required && argNameInDefinition === undefined )
				{
					throw new MissingArgumentError( this, type, methodRule, argRule, i );
				}
			}

			// to observe argument types on runtime we have to
			// proxify the original method so we can keep under
			// control what is coming and even returning
			var proxifiedMethod = type.methods[ methodName ];

			function interfaceProxy()
			{
				var receivedArgs = args( arguments );

				for( var i = 0; i < methodRule.arguments.length; i++ )
				{
					var argRule = methodRule.arguments[ i ];
					var required = argRule.isRequired;
					var argDefault = argRule.defaultValue;
					var receivedArg = receivedArgs[ i ];
					var argNameInRule = argRule.name;
					var argNameInDefinition = definedArgs[ i ];

					// if the argument required but not received any value
					if( required && receivedArg === undefined )
					{
						// if declared default value just use it  
						if( argDefault !== undefined )
						{
							receivedArgs[ i ] = receivedArg = argDefault;
						}
						else
						{
							throw new ArgumentTypeMismatch( iface, type, methodRule, argRule, i );
						}
					}

					// console.log({ required, argNameInRule, argNameInDefinition, receivedArg});
				}

				proxifiedMethod.apply( this, receivedArgs );
			}

			interfaceProxy.dependencies =
			{
				args: args,
				ArgumentTypeMismatch: ArgumentTypeMismatch,
				methodRule: methodRule,
				definedArgs: definedArgs,
				proxifiedMethod: proxifiedMethod,
				iface: this,
				type: type
			}

			type.methods[ methodName ] = interfaceProxy;
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
