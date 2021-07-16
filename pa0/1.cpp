#include <Eigen/Core>
#include <iostream>
using namespace std;

// 因此如果参数传递的数据较大时，建议使用引用作为函数的形参，这样会提高函数的时间效率，并节省内存空间。
void load_positions(const std::vector<Eigen::Vector3f> &positions){

}

    main(void)
{
  // std::vector<Eigen::Vector3f> pos = {
  //   {2, 0, -2},
  //   {0, 2, -2},
  //   {-2, 0, -2}
  // };

  // // vector<Eigen::Vector3f>::iterator it;
  // for (auto it = pos.begin(); it != pos.end(); it++)
  // {
  //   cout << *it << endl;
  // }

  // Eigen::Vector3f a;
  // a << 1, 2, 3;
  // cout << a << endl;

  // Eigen::Vector3f b(1,2,3);
  // cout << b << endl;

  // Eigen::Vector3f c = {1,2,3};
  // cout << c << endl;

  // Eigen::Vector3f d  {1, 2, 3};
  // cout << d << endl;

  // Eigen::Vector4f v[] = {
  //   Eigen::Vector4f(1,1,1,1),
  //   Eigen::Vector4f(2,2,2,2),
  //   Eigen::Vector4f(3,3,3,3),
  //   Eigen::Vector4f(4,4,4,4),
  // };

  // for (auto &vec : v)
  // {
  //   vec = {1, 2, 3, 4};
  //   cout << vec << endl;
  // }

  int a = 1;
  int &aa = a;
  cout << a << endl;
  cout << aa << endl;
  aa = 2;
  cout << a << endl;
  cout << aa << endl;
}
