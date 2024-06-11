function addTooltipBehavior() {
    var tooltips = document.querySelectorAll('.tooltip-icon');

    tooltips.forEach(function(tooltip) {
        var tooltipText = tooltip.nextElementSibling;

        var toggleTooltip = function() {
            tooltipText.classList.add('active');
            
            setTimeout(function() {
                tooltipText.classList.remove('active');
            }, 2500); // 2500 milliseconds = 2.5 seconds
        };

        tooltip.addEventListener('click', toggleTooltip);

        tooltip.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleTooltip();
        });
    });
}