import { Type, Trait, Interface } from "./src/index.js";

const Markdown = Type( "Markdown" ).body(
{
	raw: "",
	plugins: {},
	renderers: {},

	construct( raw, plugins, renderers )
	{
		this.raw = raw.trim();
		this.plugins = plugins;
		this.renderers = renderers;
	},

	render( renderers )
	{
		for( const pluginName in this.plugins )
		{
			const instance = this.plugins[ pluginName ].create( this );

			console.log( instance );
			this.raw = this.replace( 
				this.raw,
				instance,
				( renderers || this.renderers )[ instance.name ]
			);
		}

		return this.raw;
	},

	replace( raw, plugin, renderer )
	{
		return raw.replace( plugin.pattern, ( ...args ) =>
			plugin.render( args, renderer )
		);
	}
});

const PluginContract = Interface( "PluginContract" ).body( plugins =>
{
	plugins.property( "args", Object ).required();
	plugins.property( "markdown", [ null, Markdown ]).required();
	plugins.property( "name", String ).required();
	plugins.property( "pattern", RegExp ).required();
	plugins.property( "matchNames", Array ).required();

	plugins.method( "construct", construct =>
	{
		construct.argument( "md", Markdown ).required();
	});
});

const Plugin = Type( "Plugin" ).abstract().implements( PluginContract ).body(
{
	args: {},
	markdown: null,
	matchNames: [ "full" ],

	construct( md )
	{
		this.markdown = md;
	},

	arg( name, value )
	{
		this.args[ name ] = value;
	},

	render( matches, renderer )
	{
		this.fulfillMatches( matches );

		if( "beforeReplace" in this )
		{
			this.beforeReplace( this.args );
		}

		return renderer.call( this, this.args );
	},

	fulfillMatches( values )
	{
		for( const [ i, name ] of this.matchNames.entries())
		{
			this.arg( name, values[ i ]);
		}
	}
});

const Header = Type( "Header" ).extends( Plugin ).body(
{
	name: "header",
	pattern: /^(#{1,6})\s+(.*?)$/mg,
	matchNames: [ "full", "sharps", "header" ],
	beforeReplace({ sharps })
	{
		this.arg( "level", sharps.length );
	}
});

const UnderlinedTitle = Type( "UnderlinedTitle" ).extends( Plugin ).body(
{
	name: "underlinedTitle",
	pattern: /^(.*?)\n([=-])+$/mg,
	matchNames: [ "full", "title", "liner" ],
	beforeReplace({ liner })
	{
		this.arg( "level", ({ "=": 1, "-": 2 })[ liner ]);
	}
});

const Italic = Type( "Italic" ).extends( Plugin ).body(
{
	name: "italic",
	matchNames: [ "full", "inner" ],
	pattern: /\*(.+)\*/g
});

const Bold = Type( "Bold" ).extends( Plugin ).body(
{
	name: "bold",
	matchNames: [ "full", "inner" ],
	pattern: /\*{2}(.+)\*{2}/g
});

const ItaBold = Type( "ItaBold" ).extends( Plugin ).body(
{
	name: "itabold",
	matchNames: [ "full", "inner" ],
	pattern: /\*{3}(.+)\*{3}/g
});

const Link = Type( "Link" ).extends( Plugin ).body(
{
	name: "link",
	matchNames: [ "full", "inner", "link", "title" ],
	pattern: /\[([\w\W]*?)\]\((.*?)(?:\s+"(.*?)")*\)/g
});

const Photo = Type( "Photo" ).extends( Plugin ).body(
{
	name: "photo",
	matchNames: [ "full", "alt", "link", "title" ],
	pattern: /\!\[([\w\W]*?)\]\((.*?)(?:\s+"(.*?)")*\)/g
});

const HTMLRenderers =
{
	header: ({ header, level }) => `<h${ level }>${ header }</h${ level }>`,
	underlinedTitle: ({ title, level }) => `<h${ level }>${ title }</h${ level }>`,
	italic: ({ inner }) => `<i>${ inner }</i>`,
	bold: ({ inner }) => `<b>${ inner }</b>`,
	itabold: ({ inner }) => `<b><i>${ inner }</i></b>`,
	link({ inner, link, title, link: oLink })
	{
		if( title ) title = 'title="' + title + '"';
		if( link ) link = 'href="' + link + '"';

		return `<a target="_blank" ${[ title, link ].join( " ")}>${ inner || oLink }</a>`;
	},
	photo: ({ alt, link, title }) =>
	{
		if( title ) title = 'title="' + title + '"';
		if( alt ) alt = 'alt="' + alt + '"';
		if( link ) link = 'src="' + link + '"';

		return `<img ${[ alt, title, link ].join( " " )}>`;
	}
}

const article = document.querySelector( "article" );
const Plugins = { Header, UnderlinedTitle, Photo, Link, ItaBold, Bold, Italic }

article.innerHTML = Markdown
	.create( article.innerHTML, Plugins, HTMLRenderers )
	.render();
