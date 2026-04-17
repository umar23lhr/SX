/**
 * SilenceX by Umar Saeed
 * ExtendScript Logic for Premiere Pro
 */

var SilenceX = {
    /**
     * Get the active sequence
     */
    getActiveSequence: function() {
        return app.project.activeSequence;
    },

    /**
     * Remove silent regions and ripple delete
     * @param {string} cutsJson - JSON string of silence regions [{start: float, end: float}]
     */
    processSilence: function(cutsJson) {
        var sequence = this.getActiveSequence();
        if (!sequence) {
            return "Error: No active sequence found.";
        }

        var cuts = JSON.parse(cutsJson);
        if (!cuts || cuts.length === 0) {
            return "Info: No silent regions to process.";
        }

        // Sort cuts in reverse order to avoid shifting issues when cutting
        // However, ripple delete shifts items, so we should process from END to START
        cuts.sort(function(a, b) {
            return b.start - a.start;
        });

        app.beginUndoGroup("SilenceX: Remove Silence");
        app.enableQE(); // Enable Quality Engineering for more advanced tools if needed

        var projectItem = sequence.projectItem;
        var audioTracks = sequence.audioTracks;
        var videoTracks = sequence.videoTracks;

        for (var i = 0; i < cuts.length; i++) {
            var cut = cuts[i];
            var startTime = cut.start;
            var endTime = cut.end;

            // In Premiere ExtendScript, we usually define In and Out points then Ripple Delete
            sequence.setInPoint(startTime);
            sequence.setOutPoint(endTime);
            
            // Perform Ripple Delete
            // Note: This deletes across ALL unlocked tracks in the sequence
            app.project.activeSequence.rippleDelete(true);
        }

        app.endUndoGroup();

        return "Success: Processed " + cuts.length + " regions.";
    },

    /**
     * Add markers for previewing silence
     */
    addSilenceMarkers: function(cutsJson) {
        var sequence = this.getActiveSequence();
        if (!sequence) return "Error: No active sequence.";

        var cuts = JSON.parse(cutsJson);
        var markers = sequence.markers;

        for (var i = 0; i < cuts.length; i++) {
            var cut = cuts[i];
            var marker = markers.createMarker(cut.start);
            marker.name = "Silence Start";
            marker.end = cut.end;
            marker.type = "Comment";
        }

        return "Success: Added " + cuts.length + " markers.";
    }
};
