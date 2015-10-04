$ ->
	block = 
		init: (root = ":root") ->
			@$block = $(root).find(".project")
			return unless @$block.length
			@cacheDom()
			@bindEvents()
			@sameHeight()

		cacheDom: ->
			@$tags = @$block.find(".project__tags")
		
		bindEvents: ->
			$(window).on "resize", @sameHeight.bind(@)
		
		sameHeight: ->
			if window.innerWidth > 768
				@$tags.sameHeightHack()
			else
				@$tags.removeAttr "style"
