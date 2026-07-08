export type Gender = 'MALE' | 'FEMALE';
export type StuntStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';

type LmsRow = { L: number; M: number; S: number };
type HazRow = LmsRow & { month: number };
type WazRow = LmsRow & { month: number };
type WhzRow = LmsRow & { height: number };

const WHO_HAZ: Record<Gender, HazRow[]> = {
  MALE: [
    { month: 0, L: 1, M: 49.884, S: 0.03795 },
    { month: 1, L: 1, M: 54.724, S: 0.03557 },
    { month: 2, L: 1, M: 58.425, S: 0.03428 },
    { month: 3, L: 1, M: 61.429, S: 0.03333 },
    { month: 4, L: 1, M: 63.886, S: 0.03267 },
    { month: 5, L: 1, M: 65.902, S: 0.03221 },
    { month: 6, L: 1, M: 67.624, S: 0.03182 },
    { month: 7, L: 1, M: 69.165, S: 0.03149 },
    { month: 8, L: 1, M: 70.599, S: 0.03119 },
    { month: 9, L: 1, M: 71.969, S: 0.03093 },
    { month: 10, L: 1, M: 73.281, S: 0.03071 },
    { month: 11, L: 1, M: 74.538, S: 0.03052 },
    { month: 12, L: 1, M: 75.749, S: 0.03038 },
    { month: 13, L: 1, M: 76.919, S: 0.03026 },
    { month: 14, L: 1, M: 78.049, S: 0.03016 },
    { month: 15, L: 1, M: 79.139, S: 0.03007 },
    { month: 16, L: 1, M: 80.188, S: 0.03000 },
    { month: 17, L: 1, M: 81.199, S: 0.02995 },
    { month: 18, L: 1, M: 82.174, S: 0.02991 },
    { month: 19, L: 1, M: 83.116, S: 0.02988 },
    { month: 20, L: 1, M: 84.027, S: 0.02985 },
    { month: 21, L: 1, M: 84.907, S: 0.02984 },
    { month: 22, L: 1, M: 85.756, S: 0.02984 },
    { month: 23, L: 1, M: 86.576, S: 0.02984 },
    { month: 24, L: 1, M: 87.369, S: 0.02984 },
    { month: 25, L: 1, M: 88.137, S: 0.02984 },
    { month: 26, L: 1, M: 88.881, S: 0.02985 },
    { month: 27, L: 1, M: 89.602, S: 0.02987 },
    { month: 28, L: 1, M: 90.302, S: 0.02989 },
    { month: 29, L: 1, M: 90.983, S: 0.02991 },
    { month: 30, L: 1, M: 91.646, S: 0.02994 },
    { month: 31, L: 1, M: 92.293, S: 0.02997 },
    { month: 32, L: 1, M: 92.925, S: 0.03000 },
    { month: 33, L: 1, M: 93.544, S: 0.03003 },
    { month: 34, L: 1, M: 94.151, S: 0.03007 },
    { month: 35, L: 1, M: 94.747, S: 0.03010 },
    { month: 36, L: 1, M: 95.334, S: 0.03014 },
    { month: 37, L: 1, M: 95.912, S: 0.03017 },
    { month: 38, L: 1, M: 96.482, S: 0.03021 },
    { month: 39, L: 1, M: 97.045, S: 0.03025 },
    { month: 40, L: 1, M: 97.602, S: 0.03028 },
    { month: 41, L: 1, M: 98.155, S: 0.03032 },
    { month: 42, L: 1, M: 98.704, S: 0.03036 },
    { month: 43, L: 1, M: 99.251, S: 0.03040 },
    { month: 44, L: 1, M: 99.797, S: 0.03044 },
    { month: 45, L: 1, M: 100.343, S: 0.03047 },
    { month: 46, L: 1, M: 100.889, S: 0.03051 },
    { month: 47, L: 1, M: 101.437, S: 0.03055 },
    { month: 48, L: 1, M: 101.987, S: 0.03059 },
    { month: 49, L: 1, M: 102.540, S: 0.03063 },
    { month: 50, L: 1, M: 103.096, S: 0.03066 },
    { month: 51, L: 1, M: 103.655, S: 0.03070 },
    { month: 52, L: 1, M: 104.218, S: 0.03074 },
    { month: 53, L: 1, M: 104.785, S: 0.03078 },
    { month: 54, L: 1, M: 105.356, S: 0.03082 },
    { month: 55, L: 1, M: 105.933, S: 0.03085 },
    { month: 56, L: 1, M: 106.514, S: 0.03089 },
    { month: 57, L: 1, M: 107.100, S: 0.03093 },
    { month: 58, L: 1, M: 107.692, S: 0.03096 },
    { month: 59, L: 1, M: 108.289, S: 0.03100 },
    { month: 60, L: 1, M: 108.889, S: 0.03103 },
  ],
  FEMALE: [
    { month: 0, L: 1, M: 49.148, S: 0.03790 },
    { month: 1, L: 1, M: 53.715, S: 0.03563 },
    { month: 2, L: 1, M: 57.326, S: 0.03411 },
    { month: 3, L: 1, M: 60.227, S: 0.03327 },
    { month: 4, L: 1, M: 62.608, S: 0.03251 },
    { month: 5, L: 1, M: 64.572, S: 0.03195 },
    { month: 6, L: 1, M: 66.231, S: 0.03151 },
    { month: 7, L: 1, M: 67.699, S: 0.03117 },
    { month: 8, L: 1, M: 69.061, S: 0.03091 },
    { month: 9, L: 1, M: 70.364, S: 0.03070 },
    { month: 10, L: 1, M: 71.629, S: 0.03055 },
    { month: 11, L: 1, M: 72.860, S: 0.03042 },
    { month: 12, L: 1, M: 74.057, S: 0.03034 },
    { month: 13, L: 1, M: 75.222, S: 0.03029 },
    { month: 14, L: 1, M: 76.356, S: 0.03025 },
    { month: 15, L: 1, M: 77.460, S: 0.03022 },
    { month: 16, L: 1, M: 78.536, S: 0.03020 },
    { month: 17, L: 1, M: 79.586, S: 0.03019 },
    { month: 18, L: 1, M: 80.612, S: 0.03020 },
    { month: 19, L: 1, M: 81.615, S: 0.03021 },
    { month: 20, L: 1, M: 82.597, S: 0.03022 },
    { month: 21, L: 1, M: 83.555, S: 0.03025 },
    { month: 22, L: 1, M: 84.491, S: 0.03027 },
    { month: 23, L: 1, M: 85.405, S: 0.03031 },
    { month: 24, L: 1, M: 86.300, S: 0.03034 },
    { month: 25, L: 1, M: 87.175, S: 0.03037 },
    { month: 26, L: 1, M: 88.032, S: 0.03041 },
    { month: 27, L: 1, M: 88.870, S: 0.03044 },
    { month: 28, L: 1, M: 89.691, S: 0.03048 },
    { month: 29, L: 1, M: 90.496, S: 0.03052 },
    { month: 30, L: 1, M: 91.286, S: 0.03056 },
    { month: 31, L: 1, M: 92.062, S: 0.03060 },
    { month: 32, L: 1, M: 92.825, S: 0.03064 },
    { month: 33, L: 1, M: 93.576, S: 0.03069 },
    { month: 34, L: 1, M: 94.316, S: 0.03073 },
    { month: 35, L: 1, M: 95.046, S: 0.03077 },
    { month: 36, L: 1, M: 95.766, S: 0.03081 },
    { month: 37, L: 1, M: 96.478, S: 0.03085 },
    { month: 38, L: 1, M: 97.181, S: 0.03089 },
    { month: 39, L: 1, M: 97.877, S: 0.03093 },
    { month: 40, L: 1, M: 98.566, S: 0.03097 },
    { month: 41, L: 1, M: 99.249, S: 0.03101 },
    { month: 42, L: 1, M: 99.928, S: 0.03105 },
    { month: 43, L: 1, M: 100.603, S: 0.03109 },
    { month: 44, L: 1, M: 101.275, S: 0.03113 },
    { month: 45, L: 1, M: 101.945, S: 0.03117 },
    { month: 46, L: 1, M: 102.614, S: 0.03121 },
    { month: 47, L: 1, M: 103.282, S: 0.03125 },
    { month: 48, L: 1, M: 103.951, S: 0.03129 },
    { month: 49, L: 1, M: 104.620, S: 0.03133 },
    { month: 50, L: 1, M: 105.291, S: 0.03137 },
    { month: 51, L: 1, M: 105.964, S: 0.03140 },
    { month: 52, L: 1, M: 106.638, S: 0.03144 },
    { month: 53, L: 1, M: 107.315, S: 0.03148 },
    { month: 54, L: 1, M: 107.994, S: 0.03152 },
    { month: 55, L: 1, M: 108.676, S: 0.03156 },
    { month: 56, L: 1, M: 109.361, S: 0.03159 },
    { month: 57, L: 1, M: 110.049, S: 0.03163 },
    { month: 58, L: 1, M: 110.740, S: 0.03167 },
    { month: 59, L: 1, M: 111.434, S: 0.03171 },
    { month: 60, L: 1, M: 112.131, S: 0.03174 },
  ],
};

const WHO_WAZ: Record<Gender, WazRow[]> = {
  MALE: [
    { month: 0, L: 0.3487, M: 3.346, S: 0.14602 },
    { month: 1, L: 0.2297, M: 4.471, S: 0.13395 },
    { month: 2, L: 0.1970, M: 5.568, S: 0.12385 },
    { month: 3, L: 0.1738, M: 6.376, S: 0.11727 },
    { month: 4, L: 0.1553, M: 7.002, S: 0.11316 },
    { month: 5, L: 0.1395, M: 7.510, S: 0.11080 },
    { month: 6, L: 0.1257, M: 7.930, S: 0.10958 },
    { month: 7, L: 0.1134, M: 8.285, S: 0.10902 },
    { month: 8, L: 0.1021, M: 8.590, S: 0.10882 },
    { month: 9, L: 0.0917, M: 8.857, S: 0.10885 },
    { month: 10, L: 0.0820, M: 9.093, S: 0.10909 },
    { month: 11, L: 0.0730, M: 9.304, S: 0.10950 },
    { month: 12, L: 0.0644, M: 9.494, S: 0.11004 },
    { month: 13, L: 0.0563, M: 9.667, S: 0.11071 },
    { month: 14, L: 0.0487, M: 9.827, S: 0.11146 },
    { month: 15, L: 0.0413, M: 9.974, S: 0.11229 },
    { month: 16, L: 0.0343, M: 10.112, S: 0.11317 },
    { month: 17, L: 0.0275, M: 10.242, S: 0.11408 },
    { month: 18, L: 0.0211, M: 10.365, S: 0.11502 },
    { month: 19, L: 0.0148, M: 10.481, S: 0.11598 },
    { month: 20, L: 0.0087, M: 10.592, S: 0.11694 },
    { month: 21, L: 0.0029, M: 10.697, S: 0.11789 },
    { month: 22, L: -0.0028, M: 10.798, S: 0.11883 },
    { month: 23, L: -0.0083, M: 10.895, S: 0.11976 },
    { month: 24, L: -0.0137, M: 10.989, S: 0.12067 },
    { month: 25, L: -0.0189, M: 11.080, S: 0.12155 },
    { month: 26, L: -0.0240, M: 11.169, S: 0.12240 },
    { month: 27, L: -0.0289, M: 11.256, S: 0.12322 },
    { month: 28, L: -0.0337, M: 11.341, S: 0.12401 },
    { month: 29, L: -0.0384, M: 11.425, S: 0.12476 },
    { month: 30, L: -0.0430, M: 11.508, S: 0.12546 },
    { month: 31, L: -0.0474, M: 11.590, S: 0.12613 },
    { month: 32, L: -0.0518, M: 11.671, S: 0.12675 },
    { month: 33, L: -0.0560, M: 11.751, S: 0.12733 },
    { month: 34, L: -0.0601, M: 11.830, S: 0.12788 },
    { month: 35, L: -0.0641, M: 11.908, S: 0.12838 },
    { month: 36, L: -0.0681, M: 11.985, S: 0.12884 },
    { month: 37, L: -0.0719, M: 12.060, S: 0.12926 },
    { month: 38, L: -0.0757, M: 12.135, S: 0.12965 },
    { month: 39, L: -0.0794, M: 12.208, S: 0.12999 },
    { month: 40, L: -0.0830, M: 12.280, S: 0.13030 },
    { month: 41, L: -0.0865, M: 12.351, S: 0.13057 },
    { month: 42, L: -0.0899, M: 12.421, S: 0.13081 },
    { month: 43, L: -0.0933, M: 12.490, S: 0.13101 },
    { month: 44, L: -0.0966, M: 12.558, S: 0.13118 },
    { month: 45, L: -0.0998, M: 12.626, S: 0.13133 },
    { month: 46, L: -0.1030, M: 12.693, S: 0.13144 },
    { month: 47, L: -0.1061, M: 12.759, S: 0.13153 },
    { month: 48, L: -0.1092, M: 12.824, S: 0.13159 },
    { month: 49, L: -0.1122, M: 12.889, S: 0.13163 },
    { month: 50, L: -0.1151, M: 12.953, S: 0.13164 },
    { month: 51, L: -0.1180, M: 13.016, S: 0.13164 },
    { month: 52, L: -0.1209, M: 13.079, S: 0.13161 },
    { month: 53, L: -0.1237, M: 13.141, S: 0.13156 },
    { month: 54, L: -0.1265, M: 13.202, S: 0.13150 },
    { month: 55, L: -0.1292, M: 13.262, S: 0.13142 },
    { month: 56, L: -0.1319, M: 13.321, S: 0.13132 },
    { month: 57, L: -0.1345, M: 13.379, S: 0.13121 },
    { month: 58, L: -0.1371, M: 13.435, S: 0.13109 },
    { month: 59, L: -0.1397, M: 13.490, S: 0.13095 },
    { month: 60, L: -0.1422, M: 13.543, S: 0.13080 },
  ],
  FEMALE: [
    { month: 0, L: 0.3809, M: 3.232, S: 0.14171 },
    { month: 1, L: 0.1714, M: 4.191, S: 0.12910 },
    { month: 2, L: 0.0962, M: 5.102, S: 0.11908 },
    { month: 3, L: 0.0402, M: 5.792, S: 0.11247 },
    { month: 4, L: -0.0050, M: 6.311, S: 0.10846 },
    { month: 5, L: -0.0430, M: 6.711, S: 0.10596 },
    { month: 6, L: -0.0756, M: 7.029, S: 0.10440 },
    { month: 7, L: -0.1039, M: 7.295, S: 0.10344 },
    { month: 8, L: -0.1288, M: 7.525, S: 0.10286 },
    { month: 9, L: -0.1507, M: 7.728, S: 0.10258 },
    { month: 10, L: -0.1700, M: 7.909, S: 0.10255 },
    { month: 11, L: -0.1872, M: 8.072, S: 0.10272 },
    { month: 12, L: -0.2024, M: 8.223, S: 0.10304 },
    { month: 13, L: -0.2158, M: 8.363, S: 0.10347 },
    { month: 14, L: -0.2278, M: 8.495, S: 0.10398 },
    { month: 15, L: -0.2385, M: 8.620, S: 0.10455 },
    { month: 16, L: -0.2481, M: 8.740, S: 0.10515 },
    { month: 17, L: -0.2568, M: 8.856, S: 0.10578 },
    { month: 18, L: -0.2648, M: 8.969, S: 0.10642 },
    { month: 19, L: -0.2722, M: 9.078, S: 0.10706 },
    { month: 20, L: -0.2792, M: 9.185, S: 0.10769 },
    { month: 21, L: -0.2858, M: 9.289, S: 0.10830 },
    { month: 22, L: -0.2920, M: 9.392, S: 0.10890 },
    { month: 23, L: -0.2980, M: 9.493, S: 0.10948 },
    { month: 24, L: -0.3038, M: 9.593, S: 0.11004 },
    { month: 25, L: -0.3093, M: 9.693, S: 0.11057 },
    { month: 26, L: -0.3147, M: 9.792, S: 0.11107 },
    { month: 27, L: -0.3198, M: 9.891, S: 0.11155 },
    { month: 28, L: -0.3248, M: 9.990, S: 0.11200 },
    { month: 29, L: -0.3296, M: 10.089, S: 0.11242 },
    { month: 30, L: -0.3342, M: 10.188, S: 0.11282 },
    { month: 31, L: -0.3387, M: 10.287, S: 0.11319 },
    { month: 32, L: -0.3431, M: 10.386, S: 0.11355 },
    { month: 33, L: -0.3473, M: 10.485, S: 0.11388 },
    { month: 34, L: -0.3514, M: 10.584, S: 0.11419 },
    { month: 35, L: -0.3554, M: 10.683, S: 0.11448 },
    { month: 36, L: -0.3593, M: 10.782, S: 0.11475 },
    { month: 37, L: -0.3631, M: 10.881, S: 0.11500 },
    { month: 38, L: -0.3668, M: 10.980, S: 0.11523 },
    { month: 39, L: -0.3704, M: 11.079, S: 0.11544 },
    { month: 40, L: -0.3739, M: 11.178, S: 0.11563 },
    { month: 41, L: -0.3774, M: 11.277, S: 0.11580 },
    { month: 42, L: -0.3807, M: 11.376, S: 0.11595 },
    { month: 43, L: -0.3840, M: 11.474, S: 0.11609 },
    { month: 44, L: -0.3872, M: 11.573, S: 0.11621 },
    { month: 45, L: -0.3903, M: 11.671, S: 0.11632 },
    { month: 46, L: -0.3934, M: 11.769, S: 0.11641 },
    { month: 47, L: -0.3964, M: 11.866, S: 0.11649 },
    { month: 48, L: -0.3994, M: 11.964, S: 0.11655 },
    { month: 49, L: -0.4023, M: 12.061, S: 0.11660 },
    { month: 50, L: -0.4051, M: 12.158, S: 0.11664 },
    { month: 51, L: -0.4079, M: 12.254, S: 0.11667 },
    { month: 52, L: -0.4107, M: 12.350, S: 0.11668 },
    { month: 53, L: -0.4134, M: 12.445, S: 0.11668 },
    { month: 54, L: -0.4161, M: 12.540, S: 0.11667 },
    { month: 55, L: -0.4188, M: 12.634, S: 0.11665 },
    { month: 56, L: -0.4214, M: 12.727, S: 0.11662 },
    { month: 57, L: -0.4239, M: 12.819, S: 0.11657 },
    { month: 58, L: -0.4265, M: 12.910, S: 0.11652 },
    { month: 59, L: -0.4290, M: 13.000, S: 0.11646 },
    { month: 60, L: -0.4314, M: 13.088, S: 0.11638 },
  ],
};

const WHO_WHZ: Record<Gender, WhzRow[]> = {
  MALE: [
    { height: 45, L: -0.3521, M: 2.441, S: 0.09182 },
    { height: 50, L: -0.3521, M: 3.053, S: 0.08742 },
    { height: 55, L: -0.3521, M: 3.880, S: 0.08285 },
    { height: 60, L: -0.3521, M: 4.924, S: 0.07936 },
    { height: 65, L: -0.3521, M: 6.100, S: 0.07745 },
    { height: 70, L: -0.3521, M: 7.336, S: 0.07658 },
    { height: 75, L: -0.3521, M: 8.487, S: 0.07584 },
    { height: 80, L: -0.3521, M: 9.580, S: 0.07558 },
    { height: 85, L: -0.3521, M: 10.667, S: 0.07597 },
    { height: 90, L: -0.3521, M: 11.774, S: 0.07697 },
    { height: 95, L: -0.3521, M: 12.908, S: 0.07841 },
    { height: 100, L: -0.3521, M: 14.057, S: 0.08003 },
    { height: 105, L: -0.3521, M: 15.212, S: 0.08160 },
    { height: 110, L: -0.3521, M: 16.371, S: 0.08300 },
    { height: 115, L: -0.3521, M: 17.537, S: 0.08422 },
    { height: 120, L: -0.3521, M: 18.715, S: 0.08530 },
  ],
  FEMALE: [
    { height: 45, L: -0.3833, M: 2.461, S: 0.08838 },
    { height: 50, L: -0.3833, M: 3.115, S: 0.08320 },
    { height: 55, L: -0.3833, M: 3.910, S: 0.08017 },
    { height: 60, L: -0.3833, M: 4.941, S: 0.07738 },
    { height: 65, L: -0.3833, M: 6.176, S: 0.07453 },
    { height: 70, L: -0.3833, M: 7.435, S: 0.07250 },
    { height: 75, L: -0.3833, M: 8.631, S: 0.07190 },
    { height: 80, L: -0.3833, M: 9.778, S: 0.07227 },
    { height: 85, L: -0.3833, M: 10.941, S: 0.07267 },
    { height: 90, L: -0.3833, M: 12.122, S: 0.07311 },
    { height: 95, L: -0.3833, M: 13.303, S: 0.07373 },
    { height: 100, L: -0.3833, M: 14.476, S: 0.07464 },
    { height: 105, L: -0.3833, M: 15.637, S: 0.07581 },
    { height: 110, L: -0.3833, M: 16.785, S: 0.07709 },
    { height: 115, L: -0.3833, M: 17.922, S: 0.07831 },
    { height: 120, L: -0.3833, M: 19.052, S: 0.07939 },
  ],
};

function interpolate<T extends { L: number; M: number; S: number }>(
  refs: T[],
  key: number,
  getKey: (r: T) => number,
): T | null {
  if (!refs.length) return null;
  if (key <= getKey(refs[0])) return refs[0];
  if (key >= getKey(refs[refs.length - 1])) return refs[refs.length - 1];
  for (let i = 0; i < refs.length - 1; i++) {
    const k1 = getKey(refs[i]);
    const k2 = getKey(refs[i + 1]);
    if (key >= k1 && key <= k2) {
      const t = (key - k1) / (k2 - k1);
      return {
        ...refs[i],
        L: refs[i].L + t * (refs[i + 1].L - refs[i].L),
        M: refs[i].M + t * (refs[i + 1].M - refs[i].M),
        S: refs[i].S + t * (refs[i + 1].S - refs[i].S),
      };
    }
  }
  return null;
}

function computeZ(x: number, L: number, M: number, S: number): number {
  return (Math.pow(x / M, L) - 1) / (L * S);
}

export function computeHaz(heightCm: number, ageMonths: number, gender: Gender): number {
  const ref = interpolate(WHO_HAZ[gender], ageMonths, (r) => r.month);
  if (!ref) return 0;
  return computeZ(heightCm, ref.L, ref.M, ref.S);
}

export function computeWaz(weightKg: number, ageMonths: number, gender: Gender): number {
  const ref = interpolate(WHO_WAZ[gender], ageMonths, (r) => r.month);
  if (!ref) return 0;
  return computeZ(weightKg, ref.L, ref.M, ref.S);
}

export function computeWhz(weightKg: number, heightCm: number, gender: Gender): number {
  const ref = interpolate(WHO_WHZ[gender], heightCm, (r) => r.height);
  if (!ref) return 0;
  return computeZ(weightKg, ref.L, ref.M, ref.S);
}

export function classifyStunting(haz: number): StuntStatus {
  if (haz >= -2.0) return 'NORMAL';
  if (haz >= -2.5) return 'AT_RISK';
  if (haz >= -3.0) return 'STUNTED';
  return 'SEVERELY_STUNTED';
}

export function computeAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}
