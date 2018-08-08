#include "generated_bindings.h"
#include "stdio.h"

int main() {
    uint32_t x = 10;

    double_it(&x);
    maybe_double_it(&x);

    printf("%d\n", x);
}
