#[no_mangle]
pub extern fn maybe_double_it(input: Option<&mut u32>) {
    input.map(|x| *x *= 2);
}

#[no_mangle]
pub extern fn double_it(input: &mut u32) {
    *input *= 2;
}





pub type Weight = f32;

#[repr(C)]
pub struct MyStruct {
    a: u32,
    b: bool,
}

#[repr(C)]
pub struct MyTuple(u8, MyStruct);

#[repr(C)]
pub struct MyGenericStruct<T> {
    vals: [T; 16],
}

#[repr(u32)]
pub enum COptionU32 {
    Some(u32),
    None
}

#[no_mangle]
pub extern fn double_it_by_val(mut input: COptionU32) -> COptionU32 {
    if let COptionU32::Some(ref mut x) = input {
        *x *= 2;
    }
    input
}

#[no_mangle]
pub extern fn dummy(_x: MyTuple, _y: MyGenericStruct<u8>, _z: Weight) {}

