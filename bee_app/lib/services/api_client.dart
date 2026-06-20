import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  // 生产环境使用 Render 后端地址，本地开发使用 localhost
  static const String _prodUrl = 'https://bee-api-86ve.onrender.com/api/v1';
  static const String _localUrl = 'http://localhost:3001/api/v1';

  static String get baseUrl {
    // 通过编译常量区分环境
    const isProd = bool.fromEnvironment('production', defaultValue: false);
    return isProd ? _prodUrl : _localUrl;
  }

  late final Dio dio;

  ApiClient() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        handler.next(error);
      },
    ));
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) =>
    dio.get(path, queryParameters: params);

  Future<Response> post(String path, {dynamic data}) =>
    dio.post(path, data: data);

  Future<Response> put(String path, {dynamic data}) =>
    dio.put(path, data: data);

  Future<Response> delete(String path) =>
    dio.delete(path);
}
