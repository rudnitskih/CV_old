$ ->
	$.fn.sameHeightHack = ->
		cssHeight = (el) ->
			v = (k) -> parseFloat $(el).css(k).replace("px", "")
			v("height") # + v("padding-bottom") + v("padding-top")

		processChunk = (chunk) ->
			minHeight = Math.min (cssHeight i for i in chunk)...
			return if minHeight is 0
			maxHeight = Math.max (cssHeight i for i in chunk)...
			$(chunk).css height: "#{maxHeight}px"

		processSameHeightHack = ->
			@css height: "auto"
			lastTop = null
			chunk = null
			@each ->
				if lastTop isnt $(@).offset().top
					processChunk chunk if chunk
					lastTop = $(@).offset().top
					chunk = [@]
				else
					chunk.push @
			if chunk?.length > 0
				processChunk chunk
				chunk = null

		processSameHeightHack.call(@)


