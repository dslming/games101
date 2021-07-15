#include<cmath>
#include <Eigen/Core>
#include <Eigen/Dense>
#include<iostream>
using namespace Eigen;
using namespace std;


int main(void) {
    float PI = 3.1415926;
    cout <<"------Homework 0-------"<<endl;
    // 给定一个点 P=(2,1), 将该点绕原点先逆时针旋转 45◦，再平移 (-1,2),
    // 计算出变换后点的坐标（要求用齐次坐标进行计算）。
    Vector3f origin(2, 1, 1);
    Vector3f point(0,0,1);
    Matrix3f transform;
    float theat = -90 * PI/180.0;
    // 绕z轴的旋转矩阵
    transform <<
        cos(theat), -sin(theat), 0,
        sin(theat), cos(theat), 0,
        0, 0, 1;
    cout << transform << endl;
    point = transform * origin;

    cout << "旋转后坐标:" << endl;
    cout << point[0]<< endl;
    cout << point[1]<< endl;

    Matrix3f shift;
    shift <<
        1, 0, -1,
        0, 1, 2,
        0, 0, 0;
    point = shift * point;
    cout << "平移后坐标:" << endl;
    cout << point[0] << endl;
    cout << point[1] << endl;

    return 0;
}
