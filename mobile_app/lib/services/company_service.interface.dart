import '../models/client.dart';

abstract class ICompanyService {
  Future<Client?> verifyCompanyCode(String code);
}
