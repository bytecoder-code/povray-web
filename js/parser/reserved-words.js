// POV-Ray Web - Reserved words table
// Copyright (C) 2026 Bill Heyman (bill@heyman.ai)
// Licensed under the GNU Affero General Public License v3.0 (see LICENSE.md)
// Generated from references/povray/source/parser/reservedwords.cpp

// Token categories (ranges for fast classification)
export const TOKEN_CATEGORY = {
    SIGNATURE: 0,
    FLOAT: 1,
    VECTOR: 2,
    COLOUR: 3,
    MISC: 4
};

// Token IDs - mirrors the C++ enum
let _id = 0;
function T() { return _id++; }

// Signature tokens
export const UTF8_SIGNATURE_TOKEN = T();
export const SIGNATURE_TOKEN_CATEGORY = T();

// Float tokens
export const ABS_TOKEN = T();
export const ACOS_TOKEN = T();
export const ACOSH_TOKEN = T();
export const ASC_TOKEN = T();
export const ASIN_TOKEN = T();
export const ASINH_TOKEN = T();
export const ATAN_TOKEN = T();
export const ATAN2_TOKEN = T();
export const ATANH_TOKEN = T();
export const BITWISE_AND_TOKEN = T();
export const BITWISE_OR_TOKEN = T();
export const BITWISE_XOR_TOKEN = T();
export const CEIL_TOKEN = T();
export const CLOCK_TOKEN = T();
export const CLOCK_ON_TOKEN = T();
export const COS_TOKEN = T();
export const COSH_TOKEN = T();
export const DEFINED_TOKEN = T();
export const DEGREES_TOKEN = T();
export const DIMENSION_SIZE_TOKEN = T();
export const DIMENSIONS_TOKEN = T();
export const DIV_TOKEN = T();
export const EXP_TOKEN = T();
export const FALSE_TOKEN = T();
export const FILE_EXISTS_TOKEN = T();
export const FLOAT_ID_TOKEN = T();
export const FLOAT_TOKEN = T();
export const FLOOR_TOKEN = T();
export const INSIDE_TOKEN = T();
export const INT_TOKEN = T();
export const LN_TOKEN = T();
export const LOG_TOKEN = T();
export const MAX_TOKEN = T();
export const MIN_TOKEN = T();
export const MOD_TOKEN = T();
export const NO_TOKEN = T();
export const NOW_TOKEN = T();
export const OFF_TOKEN = T();
export const ON_TOKEN = T();
export const PI_TOKEN = T();
export const POW_TOKEN = T();
export const PROD_TOKEN = T();
export const RADIANS_TOKEN = T();
export const RAND_TOKEN = T();
export const SEED_TOKEN = T();
export const SELECT_TOKEN = T();
export const SIN_TOKEN = T();
export const SINH_TOKEN = T();
export const SQRT_TOKEN = T();
export const STRCMP_TOKEN = T();
export const STRLEN_TOKEN = T();
export const SUM_TOKEN = T();
export const TAN_TOKEN = T();
export const TANH_TOKEN = T();
export const TAU_TOKEN = T();
export const TRUE_TOKEN = T();
export const VAL_TOKEN = T();
export const VDOT_TOKEN = T();
export const VERSION_TOKEN = T();
export const VLENGTH_TOKEN = T();
export const YES_TOKEN = T();
export const FLOAT_TOKEN_CATEGORY = T();

// Vector tokens
export const MAX_EXTENT_TOKEN = T();
export const MIN_EXTENT_TOKEN = T();
export const TRACE_TOKEN = T();
export const VAXIS_ROTATE_TOKEN = T();
export const VCROSS_TOKEN = T();
export const VECTOR_ID_TOKEN = T();
export const VNORMALIZE_TOKEN = T();
export const VROTATE_TOKEN = T();
export const VTURBULENCE_TOKEN = T();
export const X_TOKEN = T();
export const Y_TOKEN = T();
export const Z_TOKEN = T();
export const VECTOR_TOKEN_CATEGORY = T();

// Colour tokens
export const ALPHA_TOKEN = T();
export const BLUE_TOKEN = T();
export const FILTER_TOKEN = T();
export const GRAY_TOKEN = T();
export const GREEN_TOKEN = T();
export const RED_TOKEN = T();
export const RGB_TOKEN = T();
export const RGBF_TOKEN = T();
export const RGBFT_TOKEN = T();
export const RGBT_TOKEN = T();
export const SRGB_TOKEN = T();
export const SRGBF_TOKEN = T();
export const SRGBFT_TOKEN = T();
export const SRGBT_TOKEN = T();
export const TRANSMIT_TOKEN = T();
export const COLOUR_TOKEN_CATEGORY = T();

// More colour tokens
export const COLOUR_ID_TOKEN = T();
export const COLOUR_TOKEN = T();

// Miscellaneous tokens
export const AA_LEVEL_TOKEN = T();
export const AA_THRESHOLD_TOKEN = T();
export const ABSORPTION_TOKEN = T();
export const ACCURACY_TOKEN = T();
export const ADAPTIVE_TOKEN = T();
export const ADC_BAILOUT_TOKEN = T();
export const AGATE_TOKEN = T();
export const AGATE_TURB_TOKEN = T();
export const ALBEDO_TOKEN = T();
export const ALL_TOKEN = T();
export const ALL_INTERSECTIONS_TOKEN = T();
export const ALTITUDE_TOKEN = T();
export const ALWAYS_SAMPLE_TOKEN = T();
export const AMBIENT_TOKEN = T();
export const AMBIENT_LIGHT_TOKEN = T();
export const AMPERSAND_TOKEN = T();
export const ANGLE_TOKEN = T();
export const ANISOTROPY_TOKEN = T();
export const AOI_TOKEN = T();
export const APERTURE_TOKEN = T();
export const APPEND_TOKEN = T();
export const ARC_ANGLE_TOKEN = T();
export const AREA_ILLUMINATION_TOKEN = T();
export const AREA_LIGHT_TOKEN = T();
export const ARRAY_TOKEN = T();
export const ARRAY_ID_TOKEN = T();
export const ASCII_TOKEN = T();
export const ASSUMED_GAMMA_TOKEN = T();
export const AT_TOKEN = T();
export const AUTOSTOP_TOKEN = T();
export const AVERAGE_TOKEN = T();

export const B_SPLINE_TOKEN = T();
export const BACK_QUOTE_TOKEN = T();
export const BACK_SLASH_TOKEN = T();
export const BACKGROUND_TOKEN = T();
export const BAR_TOKEN = T();
export const BEZIER_SPLINE_TOKEN = T();
export const BICUBIC_PATCH_TOKEN = T();
export const BLACK_HOLE_TOKEN = T();
export const BLEND_GAMMA_TOKEN = T();
export const BLEND_MODE_TOKEN = T();
export const BLOB_TOKEN = T();
export const BLUR_SAMPLES_TOKEN = T();
export const BMP_TOKEN = T();
export const BOKEH_TOKEN = T();
export const BOUNDED_BY_TOKEN = T();
export const BOX_TOKEN = T();
export const BOXED_TOKEN = T();
export const BOZO_TOKEN = T();
export const BREAK_TOKEN = T();
export const BRICK_TOKEN = T();
export const BRICK_SIZE_TOKEN = T();
export const BRIGHTNESS_TOKEN = T();
export const BRILLIANCE_TOKEN = T();
export const BT2020_TOKEN = T();
export const BT709_TOKEN = T();
export const BUMP_MAP_TOKEN = T();
export const BUMP_SIZE_TOKEN = T();
export const BUMPS_TOKEN = T();

export const CAMERA_TOKEN = T();
export const CAMERA_ID_TOKEN = T();
export const CASE_TOKEN = T();
export const CAUSTICS_TOKEN = T();
export const CELLS_TOKEN = T();
export const CHARSET_TOKEN = T();
export const CHECKER_TOKEN = T();
export const CHR_TOKEN = T();
export const CIRCULAR_TOKEN = T();
export const CLIPPED_BY_TOKEN = T();
export const CMAP_TOKEN = T();
export const COLLECT_TOKEN = T();
export const COLOUR_MAP_TOKEN = T();
export const COLOUR_MAP_ID_TOKEN = T();
export const COMMA_TOKEN = T();
export const COMPONENT_TOKEN = T();
export const COMPOSITE_TOKEN = T();
export const CONCAT_TOKEN = T();
export const CONE_TOKEN = T();
export const CONFIDENCE_TOKEN = T();
export const CONIC_SWEEP_TOKEN = T();
export const CONSERVE_ENERGY_TOKEN = T();
export const CONTAINED_BY_TOKEN = T();
export const CONTROL0_TOKEN = T();
export const CONTROL1_TOKEN = T();
export const COUNT_TOKEN = T();
export const COORDS_TOKEN = T();
export const CRACKLE_TOKEN = T();
export const CRAND_TOKEN = T();
export const CUBE_TOKEN = T();
export const CUBIC_TOKEN = T();
export const CUBIC_SPLINE_TOKEN = T();
export const CUBIC_WAVE_TOKEN = T();
export const CUTAWAY_TEXTURES_TOKEN = T();
export const CYLINDER_TOKEN = T();
export const CYLINDRICAL_TOKEN = T();

export const DASH_TOKEN = T();
export const DATETIME_TOKEN = T();
export const DEBUG_TOKEN = T();
export const DEBUG_TAG_TOKEN = T();
export const DECLARE_TOKEN = T();
export const DEFAULT_TOKEN = T();
export const DENSITY_TOKEN = T();
export const DENSITY_ID_TOKEN = T();
export const DENSITY_FILE_TOKEN = T();
export const DENSITY_MAP_TOKEN = T();
export const DENSITY_MAP_ID_TOKEN = T();
export const DENTS_TOKEN = T();
export const DEPRECATED_TOKEN = T();
export const DF3_TOKEN = T();
export const DICTIONARY_TOKEN = T();
export const DICTIONARY_ID_TOKEN = T();
export const DIFFERENCE_TOKEN = T();
export const DIFFUSE_TOKEN = T();
export const DIRECTION_TOKEN = T();
export const DISC_TOKEN = T();
export const DISPERSION_TOKEN = T();
export const DISPERSION_SAMPLES_TOKEN = T();
export const DIST_EXP_TOKEN = T();
export const DISTANCE_TOKEN = T();
export const DOLLAR_TOKEN = T();
export const DOUBLE_ILLUMINATE_TOKEN = T();
export const DUMMY_SYMBOL_TOKEN = T();

export const ECCENTRICITY_TOKEN = T();
export const ELSE_TOKEN = T();
export const ELSEIF_TOKEN = T();
export const EMISSION_TOKEN = T();
export const EMPTY_ARRAY_TOKEN = T();
export const END_TOKEN = T();
export const END_OF_FILE_TOKEN = T();
export const EQUALS_TOKEN = T();
export const ERROR_TOKEN = T();
export const ERROR_BOUND_TOKEN = T();
export const EVALUATE_TOKEN = T();
export const EXCLAMATION_TOKEN = T();
export const EXPAND_THRESHOLDS_TOKEN = T();
export const EXPONENT_TOKEN = T();
export const EXR_TOKEN = T();
export const EXTERIOR_TOKEN = T();
export const EXTINCTION_TOKEN = T();

export const FACE_INDICES_TOKEN = T();
export const FACETS_TOKEN = T();
export const FADE_COLOUR_TOKEN = T();
export const FADE_DISTANCE_TOKEN = T();
export const FADE_POWER_TOKEN = T();
export const FALLOFF_TOKEN = T();
export const FALLOFF_ANGLE_TOKEN = T();
export const FCLOSE_TOKEN = T();
export const FILE_ID_TOKEN = T();
export const FINISH_TOKEN = T();
export const FINISH_ID_TOKEN = T();
export const FISHEYE_TOKEN = T();
export const FLATNESS_TOKEN = T();
export const FLIP_TOKEN = T();
export const FOCAL_POINT_TOKEN = T();
export const FOG_TOKEN = T();
export const FOG_ID_TOKEN = T();
export const FOG_ALT_TOKEN = T();
export const FOG_OFFSET_TOKEN = T();
export const FOG_TYPE_TOKEN = T();
export const FOPEN_TOKEN = T();
export const FOR_TOKEN = T();
export const FORM_TOKEN = T();
export const FREQUENCY_TOKEN = T();
export const FRESNEL_TOKEN = T();
export const FUNCT_ID_TOKEN = T();
export const FUNCTION_TOKEN = T();

export const GAMMA_TOKEN = T();
export const GATHER_TOKEN = T();
export const GIF_TOKEN = T();
export const GLOBAL_TOKEN = T();
export const GLOBAL_LIGHTS_TOKEN = T();
export const GLOBAL_SETTINGS_TOKEN = T();
export const GRADIENT_TOKEN = T();
export const GRANITE_TOKEN = T();
export const GRAY_THRESHOLD_TOKEN = T();

export const HASH_TOKEN = T();
export const HAT_TOKEN = T();
export const HDR_TOKEN = T();
export const HEIGHT_FIELD_TOKEN = T();
export const HEXAGON_TOKEN = T();
export const HF_GRAY_16_TOKEN = T();
export const HIERARCHY_TOKEN = T();
export const HOLLOW_TOKEN = T();
export const HYPERCOMPLEX_TOKEN = T();

export const IDENTIFIER_TOKEN = T();
export const IF_TOKEN = T();
export const IFDEF_TOKEN = T();
export const IFF_TOKEN = T();
export const IFNDEF_TOKEN = T();
export const IMAGE_MAP_TOKEN = T();
export const IMAGE_PATTERN_TOKEN = T();
export const IMPORTANCE_TOKEN = T();
export const INCLUDE_TOKEN = T();
export const INSIDE_VECTOR_TOKEN = T();
export const INTERIOR_TOKEN = T();
export const INTERIOR_ID_TOKEN = T();
export const INTERIOR_TEXTURE_TOKEN = T();
export const INTERNAL_TOKEN = T();
export const INTERPOLATE_TOKEN = T();
export const INTERSECTION_TOKEN = T();
export const INTERVALS_TOKEN = T();
export const INVERSE_TOKEN = T();
export const IOR_TOKEN = T();
export const IRID_TOKEN = T();
export const IRID_WAVELENGTH_TOKEN = T();
export const ISOSURFACE_TOKEN = T();

export const JITTER_TOKEN = T();
export const JPEG_TOKEN = T();
export const JULIA_TOKEN = T();
export const JULIA_FRACTAL_TOKEN = T();

export const LAMBDA_TOKEN = T();
export const LATHE_TOKEN = T();
export const LEFT_ANGLE_TOKEN = T();
export const LEFT_CURLY_TOKEN = T();
export const LEFT_PAREN_TOKEN = T();
export const LEFT_SQUARE_TOKEN = T();
export const LEMON_TOKEN = T();
export const LEOPARD_TOKEN = T();
export const LIGHT_GROUP_TOKEN = T();
export const LIGHT_SOURCE_TOKEN = T();
export const LINEAR_SPLINE_TOKEN = T();
export const LINEAR_SWEEP_TOKEN = T();
export const LOAD_FILE_TOKEN = T();
export const LOCAL_TOKEN = T();
export const LOCATION_TOKEN = T();
export const LOOK_AT_TOKEN = T();
export const LOOKS_LIKE_TOKEN = T();
export const LOW_ERROR_FACTOR_TOKEN = T();

export const MACRO_TOKEN = T();
export const MACRO_ID_TOKEN = T();
export const MAGNET_TOKEN = T();
export const MAJOR_RADIUS_TOKEN = T();
export const MANDEL_TOKEN = T();
export const MAP_TYPE_TOKEN = T();
export const MARBLE_TOKEN = T();
export const MATERIAL_TOKEN = T();
export const MATERIAL_ID_TOKEN = T();
export const MATERIAL_MAP_TOKEN = T();
export const MATRIX_TOKEN = T();
export const MAX_GRADIENT_TOKEN = T();
export const MAX_INTERSECTIONS_TOKEN = T();
export const MAX_ITERATION_TOKEN = T();
export const MAX_SAMPLE_TOKEN = T();
export const MAX_TRACE_TOKEN = T();
export const MAX_TRACE_LEVEL_TOKEN = T();
export const MAXIMUM_REUSE_TOKEN = T();
export const MEDIA_TOKEN = T();
export const MEDIA_ID_TOKEN = T();
export const MEDIA_ATTENUATION_TOKEN = T();
export const MEDIA_INTERACTION_TOKEN = T();
export const MERGE_TOKEN = T();
export const MESH_TOKEN = T();
export const MESH_CAMERA_TOKEN = T();
export const MESH2_TOKEN = T();
export const METALLIC_TOKEN = T();
export const METHOD_TOKEN = T();
export const METRIC_TOKEN = T();
export const MINIMUM_REUSE_TOKEN = T();
export const MIXED_TOKEN = T();
export const MM_PER_UNIT_TOKEN = T();
export const MORTAR_TOKEN = T();

export const NATURAL_SPLINE_TOKEN = T();
export const NEAREST_COUNT_TOKEN = T();
export const NO_BUMP_SCALE_TOKEN = T();
export const NO_IMAGE_TOKEN = T();
export const NO_RADIOSITY_TOKEN = T();
export const NO_REFLECTION_TOKEN = T();
export const NO_SHADOW_TOKEN = T();
export const NOISE_GENERATOR_TOKEN = T();
export const NORMAL_TOKEN = T();
export const NORMAL_ID_TOKEN = T();
export const NORMAL_INDICES_TOKEN = T();
export const NORMAL_MAP_TOKEN = T();
export const NORMAL_MAP_ID_TOKEN = T();
export const NORMAL_VECTORS_TOKEN = T();
export const NUMBER_OF_SIDES_TOKEN = T();
export const NUMBER_OF_TILES_TOKEN = T();
export const NUMBER_OF_WAVES_TOKEN = T();

export const OBJ_TOKEN = T();
export const OBJECT_TOKEN = T();
export const OBJECT_ID_TOKEN = T();
export const OCTAVES_TOKEN = T();
export const OFFSET_TOKEN = T();
export const OMEGA_TOKEN = T();
export const OMNIMAX_TOKEN = T();
export const ONCE_TOKEN = T();
export const ONION_TOKEN = T();
export const OPEN_TOKEN = T();
export const OPTIONAL_TOKEN = T();
export const ORIENT_TOKEN = T();
export const ORIENTATION_TOKEN = T();
export const ORTHOGRAPHIC_TOKEN = T();
export const OVUS_TOKEN = T();

export const PANORAMIC_TOKEN = T();
export const PARALLEL_TOKEN = T();
export const PARAMETER_ID_TOKEN = T();
export const PARAMETRIC_TOKEN = T();
export const PASS_THROUGH_TOKEN = T();
export const PATTERN_TOKEN = T();
export const PAVEMENT_TOKEN = T();
export const PERCENT_TOKEN = T();
export const PERIOD_TOKEN = T();
export const PERSPECTIVE_TOKEN = T();
export const PGM_TOKEN = T();
export const PHASE_TOKEN = T();
export const PHONG_TOKEN = T();
export const PHONG_SIZE_TOKEN = T();
export const PHOTONS_TOKEN = T();
export const PIGMENT_TOKEN = T();
export const PIGMENT_ID_TOKEN = T();
export const PIGMENT_MAP_TOKEN = T();
export const PIGMENT_MAP_ID_TOKEN = T();
export const PIGMENT_PATTERN_TOKEN = T();
export const PLANAR_TOKEN = T();
export const PLANE_TOKEN = T();
export const PLUS_TOKEN = T();
export const PNG_TOKEN = T();
export const POINT_AT_TOKEN = T();
export const POLARITY_TOKEN = T();
export const POLY_TOKEN = T();
export const POLY_WAVE_TOKEN = T();
export const POLYGON_TOKEN = T();
export const POLYNOMIAL_TOKEN = T();
export const POT_TOKEN = T();
export const POTENTIAL_TOKEN = T();
export const PPM_TOKEN = T();
export const PRECISION_TOKEN = T();
export const PRECOMPUTE_TOKEN = T();
export const PREFIX_TOKEN = T();
export const PREMULTIPLIED_TOKEN = T();
export const PRETRACE_END_TOKEN = T();
export const PRETRACE_START_TOKEN = T();
export const PRISM_TOKEN = T();
export const PROJECTED_THROUGH_TOKEN = T();
export const PWR_TOKEN = T();

export const QUADRIC_TOKEN = T();
export const QUADRATIC_SPLINE_TOKEN = T();
export const QUARTIC_TOKEN = T();
export const QUATERNION_TOKEN = T();
export const QUESTION_TOKEN = T();
export const QUICK_COLOUR_TOKEN = T();
export const QUILTED_TOKEN = T();

export const RADIAL_TOKEN = T();
export const RADIOSITY_TOKEN = T();
export const RADIUS_TOKEN = T();
export const RAINBOW_TOKEN = T();
export const RAINBOW_ID_TOKEN = T();
export const RAMP_WAVE_TOKEN = T();
export const RANGE_TOKEN = T();
export const RATIO_TOKEN = T();
export const READ_TOKEN = T();
export const RECIPROCAL_TOKEN = T();
export const RECURSION_LIMIT_TOKEN = T();
export const REFLECTION_TOKEN = T();
export const REFLECTION_EXPONENT_TOKEN = T();
export const REFRACTION_TOKEN = T();
export const REL_GE_TOKEN = T();
export const REL_LE_TOKEN = T();
export const REL_NE_TOKEN = T();
export const RENDER_TOKEN = T();
export const REPEAT_TOKEN = T();
export const RIGHT_TOKEN = T();
export const RIGHT_ANGLE_TOKEN = T();
export const RIGHT_CURLY_TOKEN = T();
export const RIGHT_PAREN_TOKEN = T();
export const RIGHT_SQUARE_TOKEN = T();
export const RIPPLES_TOKEN = T();
export const ROTATE_TOKEN = T();
export const ROUGHNESS_TOKEN = T();

export const SAMPLES_TOKEN = T();
export const SAVE_FILE_TOKEN = T();
export const SCALE_TOKEN = T();
export const SCALLOP_WAVE_TOKEN = T();
export const SCATTERING_TOKEN = T();
export const SEMI_COLON_TOKEN = T();
export const SHADOWLESS_TOKEN = T();
export const SINE_WAVE_TOKEN = T();
export const SINGLE_QUOTE_TOKEN = T();
export const SINT8_TOKEN = T();
export const SINT16BE_TOKEN = T();
export const SINT16LE_TOKEN = T();
export const SINT32BE_TOKEN = T();
export const SINT32LE_TOKEN = T();
export const SIZE_TOKEN = T();
export const SKY_TOKEN = T();
export const SKYSPHERE_TOKEN = T();
export const SKYSPHERE_ID_TOKEN = T();
export const SLASH_TOKEN = T();
export const SLICE_TOKEN = T();
export const SLOPE_TOKEN = T();
export const SLOPE_MAP_TOKEN = T();
export const SLOPE_MAP_ID_TOKEN = T();
export const SMOOTH_TOKEN = T();
export const SMOOTH_TRIANGLE_TOKEN = T();
export const SOLID_TOKEN = T();
export const SOR_TOKEN = T();
export const SPACING_TOKEN = T();
export const SPECULAR_TOKEN = T();
export const SPHERE_TOKEN = T();
export const SPHERE_SWEEP_TOKEN = T();
export const SPHERICAL_TOKEN = T();
export const SPIRAL1_TOKEN = T();
export const SPIRAL2_TOKEN = T();
export const SPLINE_TOKEN = T();
export const SPLINE_ID_TOKEN = T();
export const SPLIT_UNION_TOKEN = T();
export const SPOTLIGHT_TOKEN = T();
export const SPOTTED_TOKEN = T();
export const SQR_TOKEN = T();
export const SQUARE_TOKEN = T();
export const STAR_TOKEN = T();
export const STATISTICS_TOKEN = T();
export const STR_TOKEN = T();
export const STRENGTH_TOKEN = T();
export const STRING_ID_TOKEN = T();
export const STRING_LITERAL_TOKEN = T();
export const STRLWR_TOKEN = T();
export const STRUPR_TOKEN = T();
export const STURM_TOKEN = T();
export const SUBSTR_TOKEN = T();
export const SUBSURFACE_TOKEN = T();
export const SUPERELLIPSOID_TOKEN = T();
export const SWITCH_TOKEN = T();
export const SYS_TOKEN = T();

export const T_TOKEN = T();
export const TARGET_TOKEN = T();
export const TEMPORARY_MACRO_ID_TOKEN = T();
export const TEXT_TOKEN = T();
export const TEXTURE_TOKEN = T();
export const TEXTURE_ID_TOKEN = T();
export const TEXTURE_LIST_TOKEN = T();
export const TEXTURE_MAP_TOKEN = T();
export const TEXTURE_MAP_ID_TOKEN = T();
export const TGA_TOKEN = T();
export const THICKNESS_TOKEN = T();
export const THRESHOLD_TOKEN = T();
export const TIFF_TOKEN = T();
export const TIGHTNESS_TOKEN = T();
export const TILE2_TOKEN = T();
export const TILES_TOKEN = T();
export const TILDE_TOKEN = T();
export const TILING_TOKEN = T();
export const TOLERANCE_TOKEN = T();
export const TOROIDAL_TOKEN = T();
export const TORUS_TOKEN = T();
export const TRANSFORM_TOKEN = T();
export const TRANSFORM_ID_TOKEN = T();
export const TRANSLATE_TOKEN = T();
export const TRANSLUCENCY_TOKEN = T();
export const TRIANGLE_TOKEN = T();
export const TRIANGLE_WAVE_TOKEN = T();
export const TRIANGULAR_TOKEN = T();
export const TTF_TOKEN = T();
export const TURB_DEPTH_TOKEN = T();
export const TURBULENCE_TOKEN = T();
export const TYPE_TOKEN = T();

export const U_TOKEN = T();
export const U_STEPS_TOKEN = T();
export const UINT8_TOKEN = T();
export const UINT16BE_TOKEN = T();
export const UINT16LE_TOKEN = T();
export const ULTRA_WIDE_ANGLE_TOKEN = T();
export const UNDEF_TOKEN = T();
export const UNION_TOKEN = T();
export const UNOFFICIAL_TOKEN = T();
export const UP_TOKEN = T();
export const USE_ALPHA_TOKEN = T();
export const USE_COLOUR_TOKEN = T();
export const USE_INDEX_TOKEN = T();
export const USER_DEFINED_TOKEN = T();
export const UTF8_TOKEN = T();
export const UV_ID_TOKEN = T();
export const UV_INDICES_TOKEN = T();
export const UV_MAPPING_TOKEN = T();
export const UV_VECTORS_TOKEN = T();

export const V_TOKEN = T();
export const V_STEPS_TOKEN = T();
export const VARIANCE_TOKEN = T();
export const VECTFUNCT_ID_TOKEN = T();
export const VECTOR_4D_ID_TOKEN = T();
export const VERTEX_VECTORS_TOKEN = T();
export const VSTR_TOKEN = T();

export const WARNING_TOKEN = T();
export const WARP_TOKEN = T();
export const WATER_LEVEL_TOKEN = T();
export const WAVES_TOKEN = T();
export const WHILE_TOKEN = T();
export const WIDTH_TOKEN = T();
export const WOOD_TOKEN = T();
export const WRINKLES_TOKEN = T();
export const WRITE_TOKEN = T();

export const XYZ_TOKEN = T();

export const COLON_TOKEN = T();

export const TOKEN_COUNT = _id;

// Keyword -> TokenId lookup (genuine keywords only)
export const RESERVED_WORDS = new Map([
    ['aa_level', AA_LEVEL_TOKEN],
    ['aa_threshold', AA_THRESHOLD_TOKEN],
    ['absorption', ABSORPTION_TOKEN],
    ['abs', ABS_TOKEN],
    ['accuracy', ACCURACY_TOKEN],
    ['acos', ACOS_TOKEN],
    ['acosh', ACOSH_TOKEN],
    ['adaptive', ADAPTIVE_TOKEN],
    ['adc_bailout', ADC_BAILOUT_TOKEN],
    ['agate', AGATE_TOKEN],
    ['agate_turb', AGATE_TURB_TOKEN],
    ['albedo', ALBEDO_TOKEN],
    ['all', ALL_TOKEN],
    ['all_intersections', ALL_INTERSECTIONS_TOKEN],
    ['alpha', ALPHA_TOKEN],
    ['altitude', ALTITUDE_TOKEN],
    ['always_sample', ALWAYS_SAMPLE_TOKEN],
    ['ambient', AMBIENT_TOKEN],
    ['ambient_light', AMBIENT_LIGHT_TOKEN],
    ['angle', ANGLE_TOKEN],
    ['anisotropy', ANISOTROPY_TOKEN],
    ['aoi', AOI_TOKEN],
    ['aperture', APERTURE_TOKEN],
    ['append', APPEND_TOKEN],
    ['arc_angle', ARC_ANGLE_TOKEN],
    ['area_illumination', AREA_ILLUMINATION_TOKEN],
    ['area_light', AREA_LIGHT_TOKEN],
    ['array', ARRAY_TOKEN],
    ['asc', ASC_TOKEN],
    ['ascii', ASCII_TOKEN],
    ['asin', ASIN_TOKEN],
    ['asinh', ASINH_TOKEN],
    ['assumed_gamma', ASSUMED_GAMMA_TOKEN],
    ['atan', ATAN_TOKEN],
    ['atan2', ATAN2_TOKEN],
    ['atanh', ATANH_TOKEN],
    ['autostop', AUTOSTOP_TOKEN],
    ['average', AVERAGE_TOKEN],
    ['background', BACKGROUND_TOKEN],
    ['bezier_spline', BEZIER_SPLINE_TOKEN],
    ['bicubic_patch', BICUBIC_PATCH_TOKEN],
    ['bitwise_and', BITWISE_AND_TOKEN],
    ['bitwise_or', BITWISE_OR_TOKEN],
    ['bitwise_xor', BITWISE_XOR_TOKEN],
    ['black_hole', BLACK_HOLE_TOKEN],
    ['blend_gamma', BLEND_GAMMA_TOKEN],
    ['blend_mode', BLEND_MODE_TOKEN],
    ['blob', BLOB_TOKEN],
    ['blue', BLUE_TOKEN],
    ['blur_samples', BLUR_SAMPLES_TOKEN],
    ['bmp', BMP_TOKEN],
    ['bokeh', BOKEH_TOKEN],
    ['bounded_by', BOUNDED_BY_TOKEN],
    ['box', BOX_TOKEN],
    ['boxed', BOXED_TOKEN],
    ['bozo', BOZO_TOKEN],
    ['b_spline', B_SPLINE_TOKEN],
    ['break', BREAK_TOKEN],
    ['brick', BRICK_TOKEN],
    ['brick_size', BRICK_SIZE_TOKEN],
    ['brightness', BRIGHTNESS_TOKEN],
    ['brilliance', BRILLIANCE_TOKEN],
    ['bt2020', BT2020_TOKEN],
    ['bt709', BT709_TOKEN],
    ['bump_map', BUMP_MAP_TOKEN],
    ['bump_size', BUMP_SIZE_TOKEN],
    ['bumps', BUMPS_TOKEN],
    ['camera', CAMERA_TOKEN],
    ['case', CASE_TOKEN],
    ['caustics', CAUSTICS_TOKEN],
    ['ceil', CEIL_TOKEN],
    ['cells', CELLS_TOKEN],
    ['charset', CHARSET_TOKEN],
    ['checker', CHECKER_TOKEN],
    ['chr', CHR_TOKEN],
    ['circular', CIRCULAR_TOKEN],
    ['clipped_by', CLIPPED_BY_TOKEN],
    ['clock', CLOCK_TOKEN],
    ['clock_on', CLOCK_ON_TOKEN],
    ['cmap', CMAP_TOKEN],
    ['collect', COLLECT_TOKEN],
    ['colour', COLOUR_TOKEN],
    ['color', COLOUR_TOKEN],
    ['colour_map', COLOUR_MAP_TOKEN],
    ['color_map', COLOUR_MAP_TOKEN],
    ['component', COMPONENT_TOKEN],
    ['composite', COMPOSITE_TOKEN],
    ['concat', CONCAT_TOKEN],
    ['cone', CONE_TOKEN],
    ['confidence', CONFIDENCE_TOKEN],
    ['conic_sweep', CONIC_SWEEP_TOKEN],
    ['conserve_energy', CONSERVE_ENERGY_TOKEN],
    ['contained_by', CONTAINED_BY_TOKEN],
    ['control0', CONTROL0_TOKEN],
    ['control1', CONTROL1_TOKEN],
    ['coords', COORDS_TOKEN],
    ['cos', COS_TOKEN],
    ['cosh', COSH_TOKEN],
    ['count', COUNT_TOKEN],
    ['crackle', CRACKLE_TOKEN],
    ['crand', CRAND_TOKEN],
    ['cube', CUBE_TOKEN],
    ['cubic', CUBIC_TOKEN],
    ['cubic_spline', CUBIC_SPLINE_TOKEN],
    ['cubic_wave', CUBIC_WAVE_TOKEN],
    ['cutaway_textures', CUTAWAY_TEXTURES_TOKEN],
    ['cylinder', CYLINDER_TOKEN],
    ['cylindrical', CYLINDRICAL_TOKEN],
    ['datetime', DATETIME_TOKEN],
    ['debug', DEBUG_TOKEN],
    ['declare', DECLARE_TOKEN],
    ['default', DEFAULT_TOKEN],
    ['defined', DEFINED_TOKEN],
    ['degrees', DEGREES_TOKEN],
    ['density', DENSITY_TOKEN],
    ['density_file', DENSITY_FILE_TOKEN],
    ['density_map', DENSITY_MAP_TOKEN],
    ['dents', DENTS_TOKEN],
    ['deprecated', DEPRECATED_TOKEN],
    ['df3', DF3_TOKEN],
    ['dictionary', DICTIONARY_TOKEN],
    ['difference', DIFFERENCE_TOKEN],
    ['diffuse', DIFFUSE_TOKEN],
    ['dimension_size', DIMENSION_SIZE_TOKEN],
    ['dimensions', DIMENSIONS_TOKEN],
    ['direction', DIRECTION_TOKEN],
    ['disc', DISC_TOKEN],
    ['dispersion', DISPERSION_TOKEN],
    ['dispersion_samples', DISPERSION_SAMPLES_TOKEN],
    ['dist_exp', DIST_EXP_TOKEN],
    ['distance', DISTANCE_TOKEN],
    ['div', DIV_TOKEN],
    ['double_illuminate', DOUBLE_ILLUMINATE_TOKEN],
    ['dtag', DEBUG_TAG_TOKEN],
    ['eccentricity', ECCENTRICITY_TOKEN],
    ['else', ELSE_TOKEN],
    ['elseif', ELSEIF_TOKEN],
    ['emission', EMISSION_TOKEN],
    ['end', END_TOKEN],
    ['error', ERROR_TOKEN],
    ['error_bound', ERROR_BOUND_TOKEN],
    ['evaluate', EVALUATE_TOKEN],
    ['exp', EXP_TOKEN],
    ['expand_thresholds', EXPAND_THRESHOLDS_TOKEN],
    ['exponent', EXPONENT_TOKEN],
    ['exr', EXR_TOKEN],
    ['exterior', EXTERIOR_TOKEN],
    ['extinction', EXTINCTION_TOKEN],
    ['face_indices', FACE_INDICES_TOKEN],
    ['facets', FACETS_TOKEN],
    ['fade_colour', FADE_COLOUR_TOKEN],
    ['fade_color', FADE_COLOUR_TOKEN],
    ['fade_distance', FADE_DISTANCE_TOKEN],
    ['fade_power', FADE_POWER_TOKEN],
    ['falloff', FALLOFF_TOKEN],
    ['falloff_angle', FALLOFF_ANGLE_TOKEN],
    ['false', FALSE_TOKEN],
    ['fclose', FCLOSE_TOKEN],
    ['file_exists', FILE_EXISTS_TOKEN],
    ['filter', FILTER_TOKEN],
    ['finish', FINISH_TOKEN],
    ['fisheye', FISHEYE_TOKEN],
    ['flatness', FLATNESS_TOKEN],
    ['flip', FLIP_TOKEN],
    ['floor', FLOOR_TOKEN],
    ['focal_point', FOCAL_POINT_TOKEN],
    ['fog', FOG_TOKEN],
    ['fog_alt', FOG_ALT_TOKEN],
    ['fog_offset', FOG_OFFSET_TOKEN],
    ['fog_type', FOG_TYPE_TOKEN],
    ['fopen', FOPEN_TOKEN],
    ['for', FOR_TOKEN],
    ['form', FORM_TOKEN],
    ['frequency', FREQUENCY_TOKEN],
    ['fresnel', FRESNEL_TOKEN],
    ['function', FUNCTION_TOKEN],
    ['gamma', GAMMA_TOKEN],
    ['gather', GATHER_TOKEN],
    ['gif', GIF_TOKEN],
    ['global', GLOBAL_TOKEN],
    ['global_lights', GLOBAL_LIGHTS_TOKEN],
    ['global_settings', GLOBAL_SETTINGS_TOKEN],
    ['gradient', GRADIENT_TOKEN],
    ['granite', GRANITE_TOKEN],
    ['gray', GRAY_TOKEN],
    ['grey', GRAY_TOKEN],
    ['gray_threshold', GRAY_THRESHOLD_TOKEN],
    ['grey_threshold', GRAY_THRESHOLD_TOKEN],
    ['green', GREEN_TOKEN],
    ['hdr', HDR_TOKEN],
    ['height_field', HEIGHT_FIELD_TOKEN],
    ['hexagon', HEXAGON_TOKEN],
    ['hf_gray_16', HF_GRAY_16_TOKEN],
    ['hf_grey_16', HF_GRAY_16_TOKEN],
    ['hierarchy', HIERARCHY_TOKEN],
    ['hollow', HOLLOW_TOKEN],
    ['hypercomplex', HYPERCOMPLEX_TOKEN],
    ['if', IF_TOKEN],
    ['ifdef', IFDEF_TOKEN],
    ['iff', IFF_TOKEN],
    ['ifndef', IFNDEF_TOKEN],
    ['image_map', IMAGE_MAP_TOKEN],
    ['image_pattern', IMAGE_PATTERN_TOKEN],
    ['importance', IMPORTANCE_TOKEN],
    ['include', INCLUDE_TOKEN],
    ['inside', INSIDE_TOKEN],
    ['inside_vector', INSIDE_VECTOR_TOKEN],
    ['int', INT_TOKEN],
    ['interior', INTERIOR_TOKEN],
    ['interior_texture', INTERIOR_TEXTURE_TOKEN],
    ['internal', INTERNAL_TOKEN],
    ['interpolate', INTERPOLATE_TOKEN],
    ['intersection', INTERSECTION_TOKEN],
    ['intervals', INTERVALS_TOKEN],
    ['inverse', INVERSE_TOKEN],
    ['ior', IOR_TOKEN],
    ['irid', IRID_TOKEN],
    ['irid_wavelength', IRID_WAVELENGTH_TOKEN],
    ['isosurface', ISOSURFACE_TOKEN],
    ['jitter', JITTER_TOKEN],
    ['jpeg', JPEG_TOKEN],
    ['julia', JULIA_TOKEN],
    ['julia_fractal', JULIA_FRACTAL_TOKEN],
    ['lambda', LAMBDA_TOKEN],
    ['lathe', LATHE_TOKEN],
    ['lemon', LEMON_TOKEN],
    ['leopard', LEOPARD_TOKEN],
    ['light_group', LIGHT_GROUP_TOKEN],
    ['light_source', LIGHT_SOURCE_TOKEN],
    ['linear_spline', LINEAR_SPLINE_TOKEN],
    ['linear_sweep', LINEAR_SWEEP_TOKEN],
    ['ln', LN_TOKEN],
    ['load_file', LOAD_FILE_TOKEN],
    ['local', LOCAL_TOKEN],
    ['location', LOCATION_TOKEN],
    ['log', LOG_TOKEN],
    ['look_at', LOOK_AT_TOKEN],
    ['looks_like', LOOKS_LIKE_TOKEN],
    ['low_error_factor', LOW_ERROR_FACTOR_TOKEN],
    ['macro', MACRO_TOKEN],
    ['magnet', MAGNET_TOKEN],
    ['major_radius', MAJOR_RADIUS_TOKEN],
    ['mandel', MANDEL_TOKEN],
    ['map_type', MAP_TYPE_TOKEN],
    ['marble', MARBLE_TOKEN],
    ['material', MATERIAL_TOKEN],
    ['material_map', MATERIAL_MAP_TOKEN],
    ['matrix', MATRIX_TOKEN],
    ['max', MAX_TOKEN],
    ['max_extent', MAX_EXTENT_TOKEN],
    ['max_gradient', MAX_GRADIENT_TOKEN],
    ['max_intersections', MAX_INTERSECTIONS_TOKEN],
    ['max_iteration', MAX_ITERATION_TOKEN],
    ['max_sample', MAX_SAMPLE_TOKEN],
    ['max_trace', MAX_TRACE_TOKEN],
    ['max_trace_level', MAX_TRACE_LEVEL_TOKEN],
    ['maximum_reuse', MAXIMUM_REUSE_TOKEN],
    ['media', MEDIA_TOKEN],
    ['media_attenuation', MEDIA_ATTENUATION_TOKEN],
    ['media_interaction', MEDIA_INTERACTION_TOKEN],
    ['merge', MERGE_TOKEN],
    ['mesh', MESH_TOKEN],
    ['mesh_camera', MESH_CAMERA_TOKEN],
    ['mesh2', MESH2_TOKEN],
    ['metallic', METALLIC_TOKEN],
    ['method', METHOD_TOKEN],
    ['metric', METRIC_TOKEN],
    ['min', MIN_TOKEN],
    ['min_extent', MIN_EXTENT_TOKEN],
    ['minimum_reuse', MINIMUM_REUSE_TOKEN],
    ['mixed', MIXED_TOKEN],
    ['mm_per_unit', MM_PER_UNIT_TOKEN],
    ['mod', MOD_TOKEN],
    ['mortar', MORTAR_TOKEN],
    ['natural_spline', NATURAL_SPLINE_TOKEN],
    ['nearest_count', NEAREST_COUNT_TOKEN],
    ['no', NO_TOKEN],
    ['no_bump_scale', NO_BUMP_SCALE_TOKEN],
    ['no_image', NO_IMAGE_TOKEN],
    ['no_radiosity', NO_RADIOSITY_TOKEN],
    ['no_reflection', NO_REFLECTION_TOKEN],
    ['no_shadow', NO_SHADOW_TOKEN],
    ['noise_generator', NOISE_GENERATOR_TOKEN],
    ['normal', NORMAL_TOKEN],
    ['normal_indices', NORMAL_INDICES_TOKEN],
    ['normal_map', NORMAL_MAP_TOKEN],
    ['normal_vectors', NORMAL_VECTORS_TOKEN],
    ['now', NOW_TOKEN],
    ['number_of_sides', NUMBER_OF_SIDES_TOKEN],
    ['number_of_tiles', NUMBER_OF_TILES_TOKEN],
    ['number_of_waves', NUMBER_OF_WAVES_TOKEN],
    ['obj', OBJ_TOKEN],
    ['object', OBJECT_TOKEN],
    ['octaves', OCTAVES_TOKEN],
    ['off', OFF_TOKEN],
    ['offset', OFFSET_TOKEN],
    ['omega', OMEGA_TOKEN],
    ['omnimax', OMNIMAX_TOKEN],
    ['on', ON_TOKEN],
    ['once', ONCE_TOKEN],
    ['onion', ONION_TOKEN],
    ['open', OPEN_TOKEN],
    ['optional', OPTIONAL_TOKEN],
    ['orient', ORIENT_TOKEN],
    ['orientation', ORIENTATION_TOKEN],
    ['orthographic', ORTHOGRAPHIC_TOKEN],
    ['ovus', OVUS_TOKEN],
    ['panoramic', PANORAMIC_TOKEN],
    ['parallel', PARALLEL_TOKEN],
    ['parametric', PARAMETRIC_TOKEN],
    ['pass_through', PASS_THROUGH_TOKEN],
    ['pattern', PATTERN_TOKEN],
    ['pavement', PAVEMENT_TOKEN],
    ['perspective', PERSPECTIVE_TOKEN],
    ['pgm', PGM_TOKEN],
    ['phase', PHASE_TOKEN],
    ['phong', PHONG_TOKEN],
    ['phong_size', PHONG_SIZE_TOKEN],
    ['photons', PHOTONS_TOKEN],
    ['pi', PI_TOKEN],
    ['pigment', PIGMENT_TOKEN],
    ['pigment_map', PIGMENT_MAP_TOKEN],
    ['pigment_pattern', PIGMENT_PATTERN_TOKEN],
    ['planar', PLANAR_TOKEN],
    ['plane', PLANE_TOKEN],
    ['png', PNG_TOKEN],
    ['point_at', POINT_AT_TOKEN],
    ['polarity', POLARITY_TOKEN],
    ['poly', POLY_TOKEN],
    ['poly_wave', POLY_WAVE_TOKEN],
    ['polygon', POLYGON_TOKEN],
    ['polynomial', POLYNOMIAL_TOKEN],
    ['pot', POT_TOKEN],
    ['potential', POTENTIAL_TOKEN],
    ['pow', POW_TOKEN],
    ['ppm', PPM_TOKEN],
    ['precision', PRECISION_TOKEN],
    ['precompute', PRECOMPUTE_TOKEN],
    ['premultiplied', PREMULTIPLIED_TOKEN],
    ['pretrace_end', PRETRACE_END_TOKEN],
    ['pretrace_start', PRETRACE_START_TOKEN],
    ['prism', PRISM_TOKEN],
    ['prod', PROD_TOKEN],
    ['projected_through', PROJECTED_THROUGH_TOKEN],
    ['pwr', PWR_TOKEN],
    ['quadratic_spline', QUADRATIC_SPLINE_TOKEN],
    ['quadric', QUADRIC_TOKEN],
    ['quartic', QUARTIC_TOKEN],
    ['quaternion', QUATERNION_TOKEN],
    ['quick_colour', QUICK_COLOUR_TOKEN],
    ['quick_color', QUICK_COLOUR_TOKEN],
    ['quilted', QUILTED_TOKEN],
    ['radial', RADIAL_TOKEN],
    ['radians', RADIANS_TOKEN],
    ['radiosity', RADIOSITY_TOKEN],
    ['radius', RADIUS_TOKEN],
    ['rainbow', RAINBOW_TOKEN],
    ['ramp_wave', RAMP_WAVE_TOKEN],
    ['rand', RAND_TOKEN],
    ['range', RANGE_TOKEN],
    ['ratio', RATIO_TOKEN],
    ['read', READ_TOKEN],
    ['reciprocal', RECIPROCAL_TOKEN],
    ['recursion_limit', RECURSION_LIMIT_TOKEN],
    ['red', RED_TOKEN],
    ['reflection', REFLECTION_TOKEN],
    ['reflection_exponent', REFLECTION_EXPONENT_TOKEN],
    ['refraction', REFRACTION_TOKEN],
    ['render', RENDER_TOKEN],
    ['repeat', REPEAT_TOKEN],
    ['rgb', RGB_TOKEN],
    ['rgbf', RGBF_TOKEN],
    ['rgbft', RGBFT_TOKEN],
    ['rgbt', RGBT_TOKEN],
    ['right', RIGHT_TOKEN],
    ['ripples', RIPPLES_TOKEN],
    ['rotate', ROTATE_TOKEN],
    ['roughness', ROUGHNESS_TOKEN],
    ['samples', SAMPLES_TOKEN],
    ['save_file', SAVE_FILE_TOKEN],
    ['scale', SCALE_TOKEN],
    ['scallop_wave', SCALLOP_WAVE_TOKEN],
    ['scattering', SCATTERING_TOKEN],
    ['seed', SEED_TOKEN],
    ['select', SELECT_TOKEN],
    ['shadowless', SHADOWLESS_TOKEN],
    ['sine_wave', SINE_WAVE_TOKEN],
    ['sin', SIN_TOKEN],
    ['sinh', SINH_TOKEN],
    ['sint8', SINT8_TOKEN],
    ['sint16be', SINT16BE_TOKEN],
    ['sint16le', SINT16LE_TOKEN],
    ['sint32be', SINT32BE_TOKEN],
    ['sint32le', SINT32LE_TOKEN],
    ['size', SIZE_TOKEN],
    ['sky', SKY_TOKEN],
    ['sky_sphere', SKYSPHERE_TOKEN],
    ['slice', SLICE_TOKEN],
    ['slope', SLOPE_TOKEN],
    ['slope_map', SLOPE_MAP_TOKEN],
    ['smooth', SMOOTH_TOKEN],
    ['smooth_triangle', SMOOTH_TRIANGLE_TOKEN],
    ['solid', SOLID_TOKEN],
    ['sor', SOR_TOKEN],
    ['spacing', SPACING_TOKEN],
    ['specular', SPECULAR_TOKEN],
    ['sphere', SPHERE_TOKEN],
    ['sphere_sweep', SPHERE_SWEEP_TOKEN],
    ['spherical', SPHERICAL_TOKEN],
    ['spiral1', SPIRAL1_TOKEN],
    ['spiral2', SPIRAL2_TOKEN],
    ['spline', SPLINE_TOKEN],
    ['split_union', SPLIT_UNION_TOKEN],
    ['spotlight', SPOTLIGHT_TOKEN],
    ['spotted', SPOTTED_TOKEN],
    ['sqrt', SQRT_TOKEN],
    ['sqr', SQR_TOKEN],
    ['square', SQUARE_TOKEN],
    ['srgb', SRGB_TOKEN],
    ['srgbf', SRGBF_TOKEN],
    ['srgbft', SRGBFT_TOKEN],
    ['srgbt', SRGBT_TOKEN],
    ['statistics', STATISTICS_TOKEN],
    ['str', STR_TOKEN],
    ['strcmp', STRCMP_TOKEN],
    ['strength', STRENGTH_TOKEN],
    ['strlen', STRLEN_TOKEN],
    ['strlwr', STRLWR_TOKEN],
    ['strupr', STRUPR_TOKEN],
    ['sturm', STURM_TOKEN],
    ['substr', SUBSTR_TOKEN],
    ['subsurface', SUBSURFACE_TOKEN],
    ['sum', SUM_TOKEN],
    ['superellipsoid', SUPERELLIPSOID_TOKEN],
    ['switch', SWITCH_TOKEN],
    ['sys', SYS_TOKEN],
    ['t', T_TOKEN],
    ['tan', TAN_TOKEN],
    ['tanh', TANH_TOKEN],
    ['target', TARGET_TOKEN],
    ['tau', TAU_TOKEN],
    ['text', TEXT_TOKEN],
    ['texture', TEXTURE_TOKEN],
    ['texture_list', TEXTURE_LIST_TOKEN],
    ['texture_map', TEXTURE_MAP_TOKEN],
    ['tga', TGA_TOKEN],
    ['thickness', THICKNESS_TOKEN],
    ['threshold', THRESHOLD_TOKEN],
    ['tiff', TIFF_TOKEN],
    ['tightness', TIGHTNESS_TOKEN],
    ['tile2', TILE2_TOKEN],
    ['tiles', TILES_TOKEN],
    ['tiling', TILING_TOKEN],
    ['tolerance', TOLERANCE_TOKEN],
    ['toroidal', TOROIDAL_TOKEN],
    ['torus', TORUS_TOKEN],
    ['trace', TRACE_TOKEN],
    ['transform', TRANSFORM_TOKEN],
    ['translate', TRANSLATE_TOKEN],
    ['translucency', TRANSLUCENCY_TOKEN],
    ['transmit', TRANSMIT_TOKEN],
    ['triangle', TRIANGLE_TOKEN],
    ['triangle_wave', TRIANGLE_WAVE_TOKEN],
    ['triangular', TRIANGULAR_TOKEN],
    ['true', TRUE_TOKEN],
    ['ttf', TTF_TOKEN],
    ['turb_depth', TURB_DEPTH_TOKEN],
    ['turbulence', TURBULENCE_TOKEN],
    ['type', TYPE_TOKEN],
    ['u', U_TOKEN],
    ['u_steps', U_STEPS_TOKEN],
    ['uint8', UINT8_TOKEN],
    ['uint16be', UINT16BE_TOKEN],
    ['uint16le', UINT16LE_TOKEN],
    ['ultra_wide_angle', ULTRA_WIDE_ANGLE_TOKEN],
    ['undef', UNDEF_TOKEN],
    ['union', UNION_TOKEN],
    ['unofficial', UNOFFICIAL_TOKEN],
    ['up', UP_TOKEN],
    ['use_alpha', USE_ALPHA_TOKEN],
    ['use_colour', USE_COLOUR_TOKEN],
    ['use_color', USE_COLOUR_TOKEN],
    ['use_index', USE_INDEX_TOKEN],
    ['user_defined', USER_DEFINED_TOKEN],
    ['utf8', UTF8_TOKEN],
    ['uv_indices', UV_INDICES_TOKEN],
    ['uv_mapping', UV_MAPPING_TOKEN],
    ['uv_vectors', UV_VECTORS_TOKEN],
    ['v', V_TOKEN],
    ['v_steps', V_STEPS_TOKEN],
    ['val', VAL_TOKEN],
    ['variance', VARIANCE_TOKEN],
    ['vaxis_rotate', VAXIS_ROTATE_TOKEN],
    ['vcross', VCROSS_TOKEN],
    ['vdot', VDOT_TOKEN],
    ['version', VERSION_TOKEN],
    ['vertex_vectors', VERTEX_VECTORS_TOKEN],
    ['vlength', VLENGTH_TOKEN],
    ['vnormalize', VNORMALIZE_TOKEN],
    ['vrotate', VROTATE_TOKEN],
    ['vstr', VSTR_TOKEN],
    ['vturbulence', VTURBULENCE_TOKEN],
    ['warning', WARNING_TOKEN],
    ['warp', WARP_TOKEN],
    ['water_level', WATER_LEVEL_TOKEN],
    ['waves', WAVES_TOKEN],
    ['while', WHILE_TOKEN],
    ['width', WIDTH_TOKEN],
    ['wood', WOOD_TOKEN],
    ['wrinkles', WRINKLES_TOKEN],
    ['write', WRITE_TOKEN],
    ['x', X_TOKEN],
    ['xyz', XYZ_TOKEN],
    ['y', Y_TOKEN],
    ['yes', YES_TOKEN],
    ['z', Z_TOKEN],
]);

// Token category classification
export function getTokenCategory(tokenId) {
    if (tokenId <= SIGNATURE_TOKEN_CATEGORY) return TOKEN_CATEGORY.SIGNATURE;
    if (tokenId <= FLOAT_TOKEN_CATEGORY) return TOKEN_CATEGORY.FLOAT;
    if (tokenId <= VECTOR_TOKEN_CATEGORY) return TOKEN_CATEGORY.VECTOR;
    if (tokenId <= COLOUR_TOKEN_CATEGORY) return TOKEN_CATEGORY.COLOUR;
    return TOKEN_CATEGORY.MISC;
}

export function isFloatToken(tokenId) {
    return tokenId > SIGNATURE_TOKEN_CATEGORY && tokenId < FLOAT_TOKEN_CATEGORY;
}

export function isVectorToken(tokenId) {
    return tokenId > FLOAT_TOKEN_CATEGORY && tokenId < VECTOR_TOKEN_CATEGORY;
}

export function isColourToken(tokenId) {
    return tokenId > VECTOR_TOKEN_CATEGORY && tokenId < COLOUR_TOKEN_CATEGORY;
}
