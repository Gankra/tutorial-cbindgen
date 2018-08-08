#include <cstdint>
#include <cstdlib>

union COptionU32 {
  enum class Tag : uint32_t {
    Some,
    None,
  };

  struct Some_Body {
    Tag tag;
    uint32_t _0;
  };

  struct {
    Tag tag;
  };
  Some_Body some;

  static COptionU32 Some(uint32_t const& a0) {
    COptionU32 result;
    result.some._0 = a0;
    result.tag = Tag::Some;
    return result;
  }

  static COptionU32 None() {
    COptionU32 result;
    result.tag = Tag::None;
    return result;
  }

  bool IsSome() const {
    return tag == Tag::Some;
  }

  bool IsNone() const {
    return tag == Tag::None;
  }
};

struct MyStruct {
  uint32_t a;
  bool b;
};

struct MyTuple {
  uint8_t _0;
  MyStruct _1;
};

template<typename T>
struct MyGenericStruct {
  T vals[16];
};

using Weight = float;

extern "C" {

void double_it(uint32_t *input);

COptionU32 double_it_by_val(COptionU32 input);

void dummy(MyTuple _x, MyGenericStruct<uint8_t> _y, Weight _z);

void maybe_double_it(uint32_t *input);

} // extern "C"
