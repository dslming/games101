cmake_minimum_required (VERSION 2.8.11)
set(projectName "demo")

project (${projectName})

if (WIN32)
  message("windows 平台...")
  set(EIGEN3_INCLUDE_DIR "C:\\Program Files (x86)\\Eigen3\\include\\eigen3")
endif()

if (APPLE)
  message("APPLE 平台...")
  set(EIGEN3_INCLUDE_DIR "/usr/local/include/eigen3/")
endif()

include_directories(${EIGEN3_INCLUDE_DIR})

add_executable (${projectName} main.cpp)
