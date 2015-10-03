$ ->
	$block = $(".project")
	return unless $block.length
	$block.find(".project__name").sameHeightHack()
	$block.find(".project__tags").sameHeightHack()