import { IGNORE, INSERT, ENTER, LEAVE } from './Actions.mjs';
import { Parser } from './Parser.mjs';
import { AnsiRenderer } from './AnsiRenderer.mjs';

const renderer = new AnsiRenderer;

const refresh = (box, source, escaped) => {

	while(box.firstChild)
	{
		box.firstChild.remove();
	}

	const lines  = source.split(/\n/);

	let tokens;

	if(escaped)
	{
		tokens = {
			reset:         /\\e\[(0);?m/
			, graphics:    /\\e\[(\d+);?(\d+)?;?([\d;]*)?./
			, escaped:     /\\([^e])/
			, characters:  /.+?(?=\\e|$)/
		};
	}
	else
	{
		tokens = {
			reset:         /\u001b\[(0);?m/
			, graphics:    /\u001b\[(\d+);?(\d+)?;?([\d;]*)?./
			, escaped:     /\\([^e])/
			, characters:  /.+?(?=\u001b|$)/
		};
	}

	const modes  = {
		normal:{
			reset:        [IGNORE, ENTER, LEAVE]
			, escaped:    [IGNORE, ENTER, LEAVE]
			, graphics:   [IGNORE, ENTER, LEAVE]
			, characters: [INSERT]
		},
	}

	const AnsiParser = new Parser(tokens, modes);

	lines.map(line => {
		renderer.reset();
		const syntax = AnsiParser.parse(line);
		const output = renderer.process(syntax);
		const div = document.createElement('div');
		div.innerHTML = output;
		box.append(div);
	});

};

document.addEventListener('DOMContentLoaded', event => {
	const box     = document.querySelector('#output');
	const escaped = document.querySelector('#escaped');
	const source  = document.querySelector('textarea');

	source.addEventListener('input', event => refresh(box, source.value, escaped.checked));
	escaped.addEventListener('input', event => refresh(box, source.value, escaped.checked));

	refresh(box, source.value, escaped.checked);
});
