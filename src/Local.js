import React, { useEffect, useState } from "react";
import { Portal } from "react-portal";

import {
  updateEditor,
  LinearView,
  CircularView,
  RowView,
  actions,
} from "open-vector-editor";
import store from "./store";

const OPTIMIZE_FEATURE_TYPE = "optimize";

const getFeatures = (state) =>
  Object.values(state?.VectorEditor?.DemoEditor?.sequenceData?.features ?? {});

const getNewLocations = (locations, annotation) => {
  const { start: annotationStart, end: annotationEnd } = annotation;
  const locationsLength = locations.length;
  if (locationsLength === 0) {
    return [{ start: annotationStart, end: annotationEnd }];
  }
  const firstLocation = locations[0].start;
  const endLocation = locations[locationsLength - 1].end;
  if (annotationEnd < firstLocation) {
    return [annotation].concat(locations);
  }
  if (annotationStart > endLocation) {
    return locations.concat([annotation]);
  }
  const booleanLocationArray = Array(Math.max(annotationEnd, endLocation)).fill(
    false
  );
  locations.concat([annotation]).forEach((location) => {
    const { start, end } = location;
    booleanLocationArray.splice(
      start,
      end - start + 1,
      ...Array(end - start + 1).fill(true)
    );
  });
  const newLocations = [];
  let pointerLocationStart = 0;
  let previousValue = false;
  for (const [i, value] of booleanLocationArray.entries()) {
    if (!value) {
      if (previousValue) {
        newLocations.push({
          start: pointerLocationStart,
          end: i - 1,
        });
      }
    }
    if (value) {
      if (!previousValue) pointerLocationStart = i;
    }
    previousValue = value;
  }
  if (previousValue) {
    newLocations.push({
      start: pointerLocationStart,
      end: booleanLocationArray.length - 1,
    });
  }
  return newLocations;
};

const Local = () => {
  const [displayCircular, setDisplayCircular] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [annotation, setAnnotation] = useState(null);

  const features = getFeatures(store.getState());

  const handleOptimize = () => {
    const optimizeFeatureIndex = features.findIndex(
      (feature) => feature.feature_type === OPTIMIZE_FEATURE_TYPE
    );
    if (optimizeFeatureIndex === -1) {
      store.dispatch(
        actions.upsertFeature(annotation, {
          editorName: "DemoEditor",
        })
      );
    } else {
      const optimizeFeature = features[optimizeFeatureIndex];
      const {
        start: startOptimizeFeature,
        end: endOptimizeFeature,
        locations,
      } = optimizeFeature;
      const { start, end } = annotation;
      const newStart = Math.min(start, startOptimizeFeature);
      const newEnd = Math.max(end, endOptimizeFeature);
      const newLocations = getNewLocations(
        locations ?? [{ start: startOptimizeFeature, end: endOptimizeFeature }],
        annotation
      );
      const newOptimizeFeature = {
        ...optimizeFeature,
        start: newStart,
        end: newEnd,
        locations: newLocations,
      };
      store.dispatch(
        // Here combine with existing features
        actions.upsertFeature(newOptimizeFeature, {
          editorName: "DemoEditor",
        })
      );
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    updateEditor(store, "DemoEditor", {
      sequenceData: {
        circular: true,
        sequence:
          "GATTCTCTTAAGGCCGGCACCATGGAACTGGGCCTGAGCTGGATCTTTCTGTTGGCAATCCTGAAGGGTGTGCAGTGCGAGGTCCAGCTGGTGGAGTCTGGAGGCGGGTTGATCCAACCAGGGGGAAGTCTGCGCCTGTCATGTGCTGCGTCTGGTTTCGCCCTGCTCGAGAGAATGTACGATATGCATTGGGTGCGGCAGACCATCGATAAACGTTTGGAATGGGTCCACAACCACTACACGCAGAAATCCCTCTCCCTGTCACCCGGGAAATAAGTCTTCTTGACGAGCATTCCTAGGGGTCTTTCCCCTCTCGCCAAAGGAATGCAAGGTCTGTTCATGGACATGCGCGTGCCCGCCCAGCTCCTGGGGCTTCTCCTTCTGTGGCTGTCCGGCGCCCGCTGTGACATTCAGATGACTCAATCTCCCAGTTCCCTTTCTGCGAGCGTGGGTGATAGGATTACCATTACCTGTAGGGCTTCCCAAGCCTTCGATAACTATGTGGCCTGGTATCAACAGCGCCCTGGCAAGGTGCCCAAACTCCTGATCTCAGCAGCCAGTGCGCTCCACGCCGGGGTGCCATCCCGCTTCTAACTCGAGCGGTAG",
        features: [
          {
            end: 21,
            feature_type: "restriction_site",
            id: "5_seq",
            name: "5_seq",
            optimise: false,
            start: 1,
          },
          {
            end: 82,
            feature_type: "misc",
            id: "protein_bind_region",
            name: "protein_bind_region",
            optimise: false,
            start: 14,
          },
          {
            end: 276,
            feature_type: "CDS",
            id: "cds_1",
            name: "cds_1",
            optimise: true,
            start: 22,
          },
          {
            end: 294,
            feature_type: "misc",
            id: "opt_region",
            name: "opt_region",
            optimise: true,
            start: 242,
          },
          {
            end: 339,
            feature_type: "mask",
            id: "buffer",
            name: "buffer",
            optimise: false,
            start: 277,
          },
          {
            end: 594,
            feature_type: "CDS",
            id: "cds_2",
            name: "cds_2",
            optimise: true,
            start: 340,
          },
          {
            end: 606,
            feature_type: "restriction_site",
            id: "3_seq",
            name: "3_seq",
            optimise: false,
            start: 595,
          },
        ],
        parts: [],
        name: "Toto gene",
      },
    });
  }, []);

  const rightClickOverrides = {
    selectionLayerRightClicked: (items, opts, props) => {
      setIsModalOpen(true);
      setAnnotation({
        ...opts.annotation,
        name: "Optimize",
        color: "#ec0000",
        feature_type: OPTIMIZE_FEATURE_TYPE,
        // color: "override_#ec0000", // for part
      });
    },
  };

  const el =
    document.querySelector(".selectionLayer") ??
    document.querySelector(".veSelectionLayer");
  const rect = el?.getBoundingClientRect();

  useEffect(() => {
    const interval = setInterval(() => {
      const outerRing = document.querySelector(".veAxisOuter");
      const innerRing = document.querySelector(".veAxisInner");
      if (outerRing && outerRing.style.display !== "none") {
        outerRing.style.display = "none";
      }
      if (innerRing && innerRing.style.strokeWidth !== "27px") {
        innerRing.style.current = innerRing;
        innerRing.style.current.style.strokeWidth = "27px";
        innerRing.style.current.style.stroke = "rgb(105,108,134, 0.5)";
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "50%",
          flexDirection: "column",
        }}
      >
        <button onClick={() => setDisplayCircular(!displayCircular)}>
          Circular or Linear
        </button>
        {displayCircular ? (
          <CircularView
            annotationLabelVisibility={{
              features: true,
              parts: true,
              cutsites: true,
            }}
            withZoomCircularView={true}
            withRotateCircularView={true}
            editorName="DemoEditor"
            dimensions={{ width: 600, height: 800 }}
            tabHeight={150}
            rightClickOverrides={rightClickOverrides}
          />
        ) : (
          <LinearView
            rightClickOverrides={rightClickOverrides}
            withZoomLinearView={true}
            editorName="DemoEditor"
            dimensions={{ width: 600, height: 800 }}
            tabHeight={150}
          />
        )}
      </div>
      <div>
        <RowView
          rightClickOverrides={rightClickOverrides}
          editorName="DemoEditor"
          dimensions={{ width: 600, height: 800 }}
          tabHeight={150}
        />
      </div>
      {el && isModalOpen && rect && (
        <Portal>
          <div
            style={{
              left: rect.left + window.scrollX,
              top: rect.top + window.scrollY,
              color: "white",
              width: "200px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "gray",
              position: "absolute",
            }}
          >
            <button style={{ width: "50%" }} onClick={handleOptimize}>
              Optimize
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default Local;
