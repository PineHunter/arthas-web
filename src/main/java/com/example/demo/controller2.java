package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @Author: xinzhifu
 * @Description:
 */
@Controller
@RequestMapping
public class controller2 {


    @RequestMapping("test")
    @ResponseBody
    public String test(String one) {

        return "test";
    }
}
